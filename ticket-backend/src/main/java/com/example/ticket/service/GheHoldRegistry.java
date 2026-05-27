package com.example.ticket.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Quản lý trạng thái "đang giữ" ghế trong bộ nhớ.
 *
 * Key = "maSuKien:soThuTu"  (vd: "5:A1", "5:B3")
 * → Không cần maGhe trong DB, hoạt động được với cả ghế chưa từng đặt.
 */
@Component
public class GheHoldRegistry {

    private static final int THOI_GIAN_GIU_PHUT = 10;

    private final Map<String, HoldInfo> holdMap = new ConcurrentHashMap<>();

    public record HoldInfo(Long maTaiKhoan, LocalDateTime hetHan) {}

    // ── helpers ───────────────────────────────────────────────────────────────

    private static String key(Long maSuKien, String soThuTu) {
        return maSuKien + ":" + soThuTu;
    }

    private boolean isExpired(HoldInfo info) {
        return info.hetHan().isBefore(LocalDateTime.now());
    }

    // ── public API ────────────────────────────────────────────────────────────

    /** Giữ ghế. Nếu chính người đó đang giữ → gia hạn thêm 10 phút. */
    public void giuGhe(Long maSuKien, String soThuTu, Long maTaiKhoan) {
        holdMap.put(key(maSuKien, soThuTu), new HoldInfo(
                maTaiKhoan,
                LocalDateTime.now().plusMinutes(THOI_GIAN_GIU_PHUT)
        ));
    }

    /** Hủy giữ ghế. */
    public void huyGiu(Long maSuKien, String soThuTu) {
        holdMap.remove(key(maSuKien, soThuTu));
    }

    /**
     * Ghế có đang bị người KHÁC giữ không (còn hạn)?
     * @return true → bị người khác giữ, không cho chọn
     */
    public boolean isDangGiuBoiNguoiKhac(Long maSuKien, String soThuTu, Long maTaiKhoan) {
        String k = key(maSuKien, soThuTu);
        HoldInfo info = holdMap.get(k);
        if (info == null) return false;
        if (isExpired(info)) { holdMap.remove(k); return false; }
        return !info.maTaiKhoan().equals(maTaiKhoan);
    }

    /**
     * Trả danh sách soThuTu đang bị giữ (bởi bất kỳ ai, còn hạn)
     * trong một sự kiện — dùng để render sơ đồ ghế.
     */
    public Set<String> getDangGiuBySuKien(Long maSuKien) {
        String prefix = maSuKien + ":";
        LocalDateTime now = LocalDateTime.now();
        return holdMap.entrySet().stream()
                .filter(e -> e.getKey().startsWith(prefix))
                .filter(e -> e.getValue().hetHan().isAfter(now))
                .map(e -> e.getKey().substring(prefix.length()))   // lấy soThuTu
                .collect(Collectors.toSet());
    }

    /** Thông tin hold của một ghế cụ thể. Null nếu không giữ / hết hạn. */
    public HoldInfo getHoldInfo(Long maSuKien, String soThuTu) {
        String k = key(maSuKien, soThuTu);
        HoldInfo info = holdMap.get(k);
        if (info == null) return null;
        if (isExpired(info)) { holdMap.remove(k); return null; }
        return info;
    }

    /** Tự dọn hold hết hạn mỗi 60 giây. */
    @Scheduled(fixedDelay = 60_000)
    public void tuDongDonHetHan() {
        LocalDateTime now = LocalDateTime.now();
        holdMap.entrySet().removeIf(e -> e.getValue().hetHan().isBefore(now));
    }
}