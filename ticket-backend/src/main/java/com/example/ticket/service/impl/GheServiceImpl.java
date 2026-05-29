package com.example.ticket.service.impl;

import com.example.ticket.dto.response.GheHoldResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.service.DynamicPricingService;
import com.example.ticket.service.GheHoldRegistry;
import com.example.ticket.service.GheService;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class GheServiceImpl implements GheService {

    private final GheHoldRegistry       holdRegistry;
    private final DynamicPricingService pricingService;

    public GheServiceImpl(GheHoldRegistry holdRegistry,
                          DynamicPricingService pricingService) {
        this.holdRegistry   = holdRegistry;
        this.pricingService = pricingService;
    }

    // ── giữ ghế ───────────────────────────────────────────────────────────────

    /**
     * Giữ ghế theo khuVuc (không cần ghế tồn tại trong DB).
     *
     * Logic:
     *  1. Ghế đang bị người KHÁC giữ (còn hạn) → ném lỗi 400
     *  2. Còn lại (trống / chính mình đang giữ) → ghi / gia hạn hold
     *
     * Định giá động — TRIGGER 1:
     *  Sau khi hold thành công, gọi DynamicPricingService để kiểm tra
     *  xem V_sold mới có đẩy R qua ngưỡng bậc tiếp theo không.
     *  Giá mới chỉ áp dụng cho NGƯỜI CLICK SAU — người vừa hold đã
     *  được chốt giá cũ trong ChiTietHoaDon.
     */
    @Override
    public GheHoldResponse giuGhe(Long maSuKien, String khuVuc, Long maTaiKhoan) {
        if (holdRegistry.isDangGiuBoiNguoiKhac(maSuKien, khuVuc, maTaiKhoan)) {
            throw new BadRequestException(
                    "Ghế " + khuVuc + " đang được khách khác giữ, vui lòng chọn ghế khác");
        }

        holdRegistry.giuGhe(maSuKien, khuVuc, maTaiKhoan);

        // ── TRIGGER 1: Tính lại giá sau khi V_sold tăng lên ──────────────────
        triggerPricingAsync(maSuKien);

        GheHoldRegistry.HoldInfo info = holdRegistry.getHoldInfo(maSuKien, khuVuc);
        return new GheHoldResponse(
                khuVuc, maSuKien, maTaiKhoan,
                "DANG_GIU",
                info != null ? info.hetHan() : null
        );
    }

    // ── hủy giữ ghế ──────────────────────────────────────────────────────────

    /**
     * Hủy giữ ghế (khách bấm hủy hoặc timeout).
     *
     * Định giá động — TRIGGER 2:
     *  V_sold giảm xuống → có thể R tụt qua ngưỡng → tự động rollback giá
     *  về bậc thấp hơn để tránh "giá ảo" do HOLD spam.
     */
    @Override
    public GheHoldResponse huyGiuGhe(Long maSuKien, String khuVuc, Long maTaiKhoan) {
        holdRegistry.huyGiu(maSuKien, khuVuc);

        // ── TRIGGER 2: Tính lại giá sau khi V_sold giảm xuống ────────────────
        triggerPricingAsync(maSuKien);

        return new GheHoldResponse(khuVuc, maSuKien, maTaiKhoan, "TRONG", null);
    }

    // ── query ─────────────────────────────────────────────────────────────────

    /**
     * Trả Set<String> gồm các khuVuc ("A1", "B3"...) đang bị giữ trong sự kiện.
     * Frontend dùng trực tiếp để merge vào bookedSet khi render sơ đồ.
     */
    @Override
    public Set<String> getDanhSachDangGiu(Long maSuKien) {
        return holdRegistry.getDangGiuBySuKien(maSuKien);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    /**
     * Gọi định giá động trong thread riêng để không block response của user.
     * Nếu pricing thất bại, chỉ log warning — không ảnh hưởng đến nghiệp vụ hold.
     */
    private void triggerPricingAsync(Long maSuKien) {
        new Thread(() -> {
            try {
                pricingService.calculateAndAdjustPrice(maSuKien);
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(GheServiceImpl.class)
                        .warn("[DynamicPricing] Lỗi tính giá cho sự kiện {}: {}", maSuKien, e.getMessage());
            }
        }, "pricing-" + maSuKien).start();
    }
}