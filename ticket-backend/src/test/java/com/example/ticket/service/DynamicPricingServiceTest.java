package com.example.ticket.service;

import com.example.ticket.model.SuKien;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DynamicPricingServiceTest {

    @Mock
    private VeRepository veRepository;

    @Mock
    private SuKienRepository suKienRepository;

    @InjectMocks
    private DynamicPricingService pricingService;

    private SuKien suKien;
    private Ve ve;

    @BeforeEach
    void setUp() {
        // Cài đặt các giá trị mặc định cho service bằng ReflectionTestUtils
        DynamicPricingService service = pricingService;
        if (service != null) {
            ReflectionTestUtils.setField(service, "defaultGamma", 1.3);
            ReflectionTestUtils.setField(service, "defaultClearanceDays", 3);
            ReflectionTestUtils.setField(service, "pricingEnabled", true);
        }

        // Thiết lập Sự kiện thử nghiệm
        suKien = new SuKien();
        suKien.setMaSuKien(1L);
        suKien.setTenSuKien("Liveshow Mỹ Tâm");
        suKien.setThoiGianBatDau(LocalDate.now().plusDays(30)); // 30 ngày nữa diễn ra
        suKien.setNgayMoBan(LocalDate.now().minusDays(10));      // Đã mở bán 10 ngày
        suKien.setDinhGiaDongBat(true);

        // Thiết lập Hạng vé thử nghiệm
        ve = new Ve();
        ve.setMaVe(100L);
        ve.setLoaiVe("VIP");
        ve.setSoLuong(1000); // V_total = 1000
        ve.setGiaGoc(1000000.0); // P_base = 1,000,000 VND
        ve.setGia(1000000.0);
        ve.setHeSoNhanGia(1.0);
        ve.setMaSuKien(1L);
    }

    /**
     * Kịch bản 1: Sức mua yếu (Fakeout)
     * R = 40% (Đáng lẽ lên Tier 1 là x1.15)
     * Nhưng V_speed = 2 vé/ngày, trong khi T_gate = ~49 vé/ngày.
     * Kết quả: Giữ nguyên giá sàn 1,000,000 VND.
     */
    @Test
    void testCalculateAndAdjustPrice_Fakeout_KeepsBasePrice() {
        // Giả lập V_sold = 400 (R = 40%)
        when(suKienRepository.findById(1L)).thenReturn(Optional.of(suKien));
        when(veRepository.findByMaSuKienWithLock(1L)).thenReturn(Arrays.asList(ve));
        when(veRepository.countVSold(100L)).thenReturn(400);

        // Giả lập V_speed trong cache cực thấp (ví dụ: chỉ có 2 vé)
        pricingService.getVSpeedCache().put(100L, 2);

        pricingService.calculateAndAdjustPrice(1L);

        // Giá hiện tại vẫn phải là 1,000,000 VND, hệ số beta = 1.0
        assertEquals(1000000.0, ve.getGia());
        assertEquals(1.0, ve.getHeSoNhanGia());
        Ve localVe = ve;
        if (localVe != null) {
            verify(veRepository, never()).save(localVe);
        }
    }

    /**
     * Kịch bản 2: Bùng nổ mua hàng (FOMO thật)
     * R = 40% (Đủ mốc Tier 1)
     * V_speed = 100 vé/ngày, lớn hơn T_gate (BRR ~ 20 * 1.3 = 26 vé/ngày)
     * Kết quả: Kích hoạt Tier 1 thành công, giá tăng lên x1.15 (1,150,000 VND).
     */
    @Test
    void testCalculateAndAdjustPrice_FOMOSurge_IncreasesToTier1() {
        when(suKienRepository.findById(1L)).thenReturn(Optional.of(suKien));
        when(veRepository.findByMaSuKienWithLock(1L)).thenReturn(Arrays.asList(ve));
        when(veRepository.countVSold(100L)).thenReturn(400); // R = 40%

        // Giả lập sức mua bùng nổ (100 vé bán ra trong ngày)
        pricingService.getVSpeedCache().put(100L, 100);

        pricingService.calculateAndAdjustPrice(1L);

        // Giá tăng lên 1,150,000 VND (x1.15), beta = 1.15
        assertEquals(1150000.0, ve.getGia());
        assertEquals(1.15, ve.getHeSoNhanGia());
        Ve localVe = ve;
        if (localVe != null) {
            verify(veRepository, times(1)).save(localVe);
        }
    }

    /**
     * Kịch bản 3: Sức mua bùng nổ mạnh mẽ hơn nữa
     * R = 75% (Đủ mốc Tier 2)
     * V_speed = 200 vé/ngày (Vượt xa T_gate)
     * Kết quả: Kích hoạt Tier 2 thành công, giá tăng lên x1.30 (1,300,000 VND).
     */
    @Test
    void testCalculateAndAdjustPrice_FOMOSurge_IncreasesToTier2() {
        when(suKienRepository.findById(1L)).thenReturn(Optional.of(suKien));
        when(veRepository.findByMaSuKienWithLock(1L)).thenReturn(Arrays.asList(ve));
        when(veRepository.countVSold(100L)).thenReturn(750); // R = 75%

        pricingService.getVSpeedCache().put(100L, 200);

        pricingService.calculateAndAdjustPrice(1L);

        assertEquals(1300000.0, ve.getGia());
        assertEquals(1.3, ve.getHeSoNhanGia());
        Ve localVe = ve;
        if (localVe != null) {
            verify(veRepository, times(1)).save(localVe);
        }
    }

    /**
     * Kịch bản 4: Rollback hạ giá (Reversible)
     * Ban đầu vé đang ở Tier 1 (giá 1,150,000 VND, beta 1.15) do có người HOLD.
     * Sau đó người dùng hủy đơn / timeout → V_sold tụt xuống còn 200 (R = 20%).
     * Kết quả: Thuật toán tự động giảm giá về Bậc Base (1,000,000 VND, beta 1.0).
     */
    @Test
    void testCalculateAndAdjustPrice_RollbackPrice_WhenCapacityDrops() {
        // Giả lập trạng thái ban đầu của vé là Tier 1 (x1.15)
        ve.setGia(1150000.0);
        ve.setHeSoNhanGia(1.15);

        when(suKienRepository.findById(1L)).thenReturn(Optional.of(suKien));
        when(veRepository.findByMaSuKienWithLock(1L)).thenReturn(Arrays.asList(ve));
        when(veRepository.countVSold(100L)).thenReturn(200); // R = 20% (Tụt về Base)

        pricingService.calculateAndAdjustPrice(1L);

        // Giá phải tự động rollback về giá sàn 1,000,000 VND, beta = 1.0
        assertEquals(1000000.0, ve.getGia());
        assertEquals(1.0, ve.getHeSoNhanGia());
        Ve localVe = ve;
        if (localVe != null) {
            verify(veRepository, times(1)).save(localVe);
        }
    }

    /**
     * Kịch bản 5: Kích hoạt Bậc Giải cứu (Clearance Markdown)
     * Sự kiện chỉ còn 2 ngày nữa diễn ra (sát nút ≤ 3 ngày).
     * Tỷ lệ lấp đầy quá thấp R = 30% (dưới 50%).
     * Lực mua đóng băng V_speed = 1 vé/ngày, nhỏ hơn BRR * 0.5 (~116 vé/ngày * 0.5 = 58).
     * Kết quả: Áp dụng Bậc Giải cứu x0.80 (800,000 VND) để xả hàng.
     */
    @Test
    void testCheckAndApplyClearance_TriggerClearance_MarkdownTo80Percent() {
        // Đưa sự kiện về thời điểm sát ngày diễn (còn 2 ngày)
        suKien.setThoiGianBatDau(LocalDate.now().plusDays(2));
        suKien.setNgayMoBan(LocalDate.now().minusDays(10));

        when(suKienRepository.findById(1L)).thenReturn(Optional.of(suKien));
        when(veRepository.findByMaSuKienWithLock(1L)).thenReturn(Arrays.asList(ve));
        
        // V_sold = 300 (R = 30% < 50%)
        when(veRepository.countVSold(100L)).thenReturn(300);
        
        // Sức mua cực yếu (V_speed = 0)
        pricingService.getVSpeedCache().put(100L, 0);

        // Chạy job clearance
        pricingService.checkAndApplyClearance(1L);

        // Giá vé giảm 20% còn 800,000 VND, beta = 0.8
        assertEquals(800000.0, ve.getGia());
        assertEquals(0.8, ve.getHeSoNhanGia());
        Ve localVe = ve;
        if (localVe != null) {
            verify(veRepository, times(1)).save(localVe);
        }
    }
}
