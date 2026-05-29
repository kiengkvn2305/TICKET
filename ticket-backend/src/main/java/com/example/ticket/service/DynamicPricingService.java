package com.example.ticket.service;

import com.example.ticket.model.SuKien;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  DynamicPricingService — Hybrid Dynamic Pricing Algorithm
 *  Ref: index.pdf — Mô hình Thuật toán Định giá Lai
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  Biến số:
 *    V_total  = ve.soLuong
 *    V_sold   = COUNT(GHE where trangThai IN ('da_dat','dang_giu'))
 *    V_remain = V_total - V_sold
 *    T_total  = thoiGianBatDau - ngayMoBan  (giờ)
 *    T_passed = now - ngayMoBan             (giờ)
 *    T_remain = T_total - T_passed          (giờ)
 *    V_speed  = số ghế bán/hold trong cửa sổ 5% T_total, clamp [1h, 24h]
 *    gamma    = cauHinhGamma của sự kiện (hoặc global default)
 *    BRR      = V_remain / T_remain
 *    HAV      = V_sold / T_passed   (nếu T_passed < 1h → HAV = BRR)
 *    T_gate   = MAX(BRR, HAV) * gamma
 *
 *  Ma trận bậc giá (β):
 *    R < 30%  → β=1.00 (Base)
 *    R < 60%  → β=1.15 (Tier 1)
 *    R < 90%  → β=1.30 (Tier 2)
 *    R ≥ 90%  → β=1.50 (Tier 3)
 *    Clearance→ β=0.80
 */
@Service
public class DynamicPricingService {

    private static final Logger log = LoggerFactory.getLogger(DynamicPricingService.class);

    // ── Hệ số nhân của từng bậc giá ──────────────────────────────────────────
    private static final double BETA_BASE       = 1.00;
    private static final double BETA_TIER1      = 1.15;
    private static final double BETA_TIER2      = 1.30;
    private static final double BETA_TIER3      = 1.50;
    private static final double BETA_CLEARANCE  = 0.80;

    // ── Ngưỡng Fill Rate kích hoạt bậc ───────────────────────────────────────
    private static final double R_TIER1 = 0.30;
    private static final double R_TIER2 = 0.60;
    private static final double R_TIER3 = 0.90;

    // ── Global defaults (từ application.properties) ───────────────────────────
    @Value("${pricing.gamma.default:1.3}")
    private double defaultGamma;

    @Value("${pricing.clearance.days-before-event:3}")
    private int defaultClearanceDays;

    @Value("${pricing.enabled:true}")
    private boolean pricingEnabled;

    // ── Cache V_speed (cập nhật bởi @Scheduled job mỗi 5 phút) ──────────────
    // Key = maVe, Value = V_speed đã tính sẵn
    private final ConcurrentMap<Long, Integer> vSpeedCache = new ConcurrentHashMap<>();

    private final VeRepository    veRepository;
    private final SuKienRepository suKienRepository;

    public DynamicPricingService(VeRepository veRepository,
                                  SuKienRepository suKienRepository) {
        this.veRepository     = veRepository;
        this.suKienRepository = suKienRepository;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PUBLIC API — được gọi từ GheServiceImpl khi HOLD / hủy HOLD
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Điểm kích hoạt chính: tính toán và điều chỉnh giá cho tất cả hạng vé
     * của một sự kiện.
     * Gọi sau khi V_sold thay đổi (HOLD mới hoặc HOLD bị hủy/timeout).
     *
     * @param maSuKien ID sự kiện vừa có biến động ghế
     */
    @Transactional
    public void calculateAndAdjustPrice(Long maSuKien) {
        if (!pricingEnabled || maSuKien == null) return;

        SuKien suKien = suKienRepository.findById(maSuKien).orElse(null);
        if (suKien == null) return;

        // Nếu sự kiện tắt định giá động riêng
        Boolean dinhGiaBat = suKien.getDinhGiaDongBat();
        if (Boolean.FALSE.equals(dinhGiaBat)) return;

        // Lấy danh sách hạng vé với PESSIMISTIC_WRITE lock
        List<Ve> danhSachVe = veRepository.findByMaSuKienWithLock(maSuKien);

        for (Ve ve : danhSachVe) {
            adjustPriceForVe(ve, suKien);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PUBLIC API — được gọi từ @Scheduled job để cập nhật V_speed cache
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Refresh V_speed cache cho tất cả hạng vé đang hoạt động.
     * Gọi mỗi 5 phút bởi PricingSchedulerService.
     */
    @Transactional(readOnly = true)
    public void refreshVSpeedCache(Long maSuKien) {
        if (maSuKien == null) return;
        SuKien suKien = suKienRepository.findById(maSuKien).orElse(null);
        if (suKien == null) return;

        List<Ve> danhSachVe = veRepository.findByMaSuKien(maSuKien);
        for (Ve ve : danhSachVe) {
            double windowHours = computeVSpeedWindow(suKien);
            int vSpeed = veRepository.countVSpeed(ve.getMaVe(), windowHours);
            vSpeedCache.put(ve.getMaVe(), vSpeed);
        }
    }

    /**
     * Kiểm tra điều kiện Bậc Giải cứu và áp dụng nếu đủ.
     * Gọi mỗi 10 phút bởi PricingSchedulerService.
     */
    @Transactional
    public void checkAndApplyClearance(Long maSuKien) {
        if (!pricingEnabled || maSuKien == null) return;

        SuKien suKien = suKienRepository.findById(maSuKien).orElse(null);
        if (suKien == null || Boolean.FALSE.equals(suKien.getDinhGiaDongBat())) return;

        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), suKien.getThoiGianBatDau());
        int clearanceDays = suKien.getNgayXaHang() != null
                ? suKien.getNgayXaHang()
                : defaultClearanceDays;

        // Điều kiện 1: còn ≤ N ngày
        if (daysRemaining > clearanceDays) return;

        List<Ve> danhSachVe = veRepository.findByMaSuKienWithLock(maSuKien);
        for (Ve ve : danhSachVe) {
            int vTotal = ve.getSoLuong();
            if (vTotal <= 0) continue;

            int vSold = veRepository.countVSold(ve.getMaVe());
            double r = (double) vSold / vTotal;

            // Điều kiện 2: R < 50%
            if (r >= 0.50) continue;

            // Điều kiện 3: V_speed đóng băng (< BRR * 0.5)
            double tRemainHours = computeTRemainHours(suKien);
            double vRemain = vTotal - vSold;
            double brr = tRemainHours > 0 ? vRemain / tRemainHours : 0;
            int vSpeed = vSpeedCache.getOrDefault(ve.getMaVe(),
                    veRepository.countVSpeed(ve.getMaVe(), computeVSpeedWindow(suKien)));

            if (vSpeed >= brr * 0.5) continue;

            // Đủ cả 3 điều kiện → Áp dụng Bậc Giải cứu
            applyBeta(ve, BETA_CLEARANCE, "Clearance");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PRIVATE — Core Logic
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Tính toán và điều chỉnh giá cho 1 hạng vé cụ thể.
     */
    private void adjustPriceForVe(Ve ve, SuKien suKien) {
        int vTotal = ve.getSoLuong();
        if (vTotal <= 0) return;

        // ── 1. Tính Fill Rate R ───────────────────────────────────────────────
        int vSold = veRepository.countVSold(ve.getMaVe());
        double r  = (double) vSold / vTotal;

        // ── 2. Tính BRR và HAV ────────────────────────────────────────────────
        double tTotalHours  = computeTTotalHours(suKien);
        double tPassedHours = computeTPassedHours(suKien);
        double tRemainHours = Math.max(tTotalHours - tPassedHours, 0.0001);
        double vRemain      = vTotal - vSold;

        double brr = vRemain / tRemainHours;
        double hav = tPassedHours < 1.0 ? brr : (double) vSold / tPassedHours;

        // ── 3. Tính T_gate ────────────────────────────────────────────────────
        double gamma  = suKien.getCauHinhGamma() != null ? suKien.getCauHinhGamma() : defaultGamma;
        double tGate  = Math.max(brr, hav) * gamma;

        // ── 4. Xác định bậc giá mục tiêu từ R ────────────────────────────────
        double targetBeta = betaFromR(r);

        // ── 5. Bậc hiện tại ───────────────────────────────────────────────────
        double currentBeta = ve.getHeSoNhanGia();

        // ── 6. Kiểm tra có cần thay đổi không ────────────────────────────────
        if (Double.compare(targetBeta, currentBeta) == 0) return; // không đổi

        // ── 7. Nhánh TĂNG giá: V_speed phải ≥ T_gate (xác nhận FOMO thật) ───
        if (targetBeta > currentBeta) {
            // Lấy V_speed từ cache (tránh query DB liên tục)
            int vSpeed = vSpeedCache.getOrDefault(ve.getMaVe(),
                    veRepository.countVSpeed(ve.getMaVe(), computeVSpeedWindow(suKien)));

            if (vSpeed < tGate) {
                log.debug("[DynamicPricing] Ve {} - Fakeout: V_speed={} < T_gate={:.2f}, giữ nguyên β={}",
                        ve.getMaVe(), vSpeed, tGate, currentBeta);
                return; // Fakeout — không tăng
            }
            applyBeta(ve, targetBeta, "Surge R=" + String.format("%.0f%%", r * 100));

        } else {
            // ── 8. Nhánh GIẢM giá: R tụt qua ngưỡng (HOLD timeout / hủy) ────
            applyBeta(ve, targetBeta, "Rollback R=" + String.format("%.0f%%", r * 100));
        }
    }

    /** Ánh xạ Fill Rate R → hệ số beta. */
    private double betaFromR(double r) {
        if (r >= R_TIER3) return BETA_TIER3;
        if (r >= R_TIER2) return BETA_TIER2;
        if (r >= R_TIER1) return BETA_TIER1;
        return BETA_BASE;
    }

    /** Áp dụng beta mới vào hạng vé và persist. */
    private void applyBeta(Ve ve, double newBeta, String reason) {
        double giaGoc = ve.getGiaGoc() > 0 ? ve.getGiaGoc() : ve.getGia(); // fallback nếu giaGoc chưa set
        double giaNew = Math.round(giaGoc * newBeta); // làm tròn số nguyên

        log.info("[DynamicPricing] Ve {} ({}) | {} | β: {} → {} | Giá: {} → {}",
                ve.getMaVe(), ve.getLoaiVe(), reason,
                ve.getHeSoNhanGia(), newBeta, ve.getGia(), giaNew);

        ve.setHeSoNhanGia(newBeta);
        ve.setGia(giaNew);
        veRepository.save(ve);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PRIVATE — Time Helpers
    // ══════════════════════════════════════════════════════════════════════════

    /** T_total (giờ) = từ ngày mở bán → ngày diễn ra sự kiện. */
    private double computeTTotalHours(SuKien suKien) {
        LocalDate moBan  = suKien.getNgayMoBan() != null
                ? suKien.getNgayMoBan()
                : suKien.getThoiGianBatDau().minusDays(30); // fallback: 30 ngày trước
        long days = ChronoUnit.DAYS.between(moBan, suKien.getThoiGianBatDau());
        return Math.max(days * 24.0, 1.0);
    }

    /** T_passed (giờ) = từ ngày mở bán → hiện tại. */
    private double computeTPassedHours(SuKien suKien) {
        LocalDate moBan = suKien.getNgayMoBan() != null
                ? suKien.getNgayMoBan()
                : suKien.getThoiGianBatDau().minusDays(30);
        long days = ChronoUnit.DAYS.between(moBan, LocalDate.now());
        return Math.max(days * 24.0, 0.0);
    }

    /** T_remain (giờ) = thoiGianBatDau - now. */
    private double computeTRemainHours(SuKien suKien) {
        long days = ChronoUnit.DAYS.between(LocalDate.now(), suKien.getThoiGianBatDau());
        return Math.max(days * 24.0, 0.0);
    }

    /**
     * Cửa sổ V_speed = 5% T_total, clamp [1h, 24h].
     */
    private double computeVSpeedWindow(SuKien suKien) {
        double tTotal = computeTTotalHours(suKien);
        double window = tTotal * 0.05;
        return Math.min(Math.max(window, 1.0), 24.0);
    }

    // ── Getter cho cache (dùng trong test) ────────────────────────────────────
    public ConcurrentMap<Long, Integer> getVSpeedCache() { return vSpeedCache; }
}
