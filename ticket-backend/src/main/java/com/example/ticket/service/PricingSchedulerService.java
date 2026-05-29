package com.example.ticket.service;

import com.example.ticket.model.SuKien;
import com.example.ticket.repository.SuKienRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled jobs cho Định giá Động:
 *
 *  Job 1 (mỗi 5 phút):  Refresh V_speed cache cho các sự kiện đang mở bán.
 *  Job 2 (mỗi 10 phút): Kiểm tra điều kiện Bậc Giải cứu (Clearance).
 *
 * Chỉ xử lý các sự kiện CHƯA diễn ra và đang "Hoạt động".
 */
@Component
public class PricingSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(PricingSchedulerService.class);

    @Value("${pricing.enabled:true}")
    private boolean pricingEnabled;

    private final DynamicPricingService pricingService;
    private final SuKienRepository      suKienRepository;

    public PricingSchedulerService(DynamicPricingService pricingService,
                                    SuKienRepository suKienRepository) {
        this.pricingService   = pricingService;
        this.suKienRepository = suKienRepository;
    }

    /**
     * Job 1: Refresh V_speed cache mỗi 5 phút.
     * Tránh query COUNT() DB liên tục trong từng giao dịch.
     */
    @Scheduled(fixedDelayString = "${pricing.scheduler.vspeed-interval-ms:300000}")
    public void refreshVSpeedCache() {
        if (!pricingEnabled) return;

        List<SuKien> suKienDangBan = getSuKienDangBan();
        log.debug("[PricingScheduler] Refresh V_speed cache cho {} sự kiện", suKienDangBan.size());

        for (SuKien sk : suKienDangBan) {
            try {
                pricingService.refreshVSpeedCache(sk.getMaSuKien());
            } catch (Exception e) {
                log.warn("[PricingScheduler] Lỗi refresh V_speed cho sự kiện {}: {}",
                        sk.getMaSuKien(), e.getMessage());
            }
        }
    }

    /**
     * Job 2: Kiểm tra điều kiện Bậc Giải cứu mỗi 10 phút.
     */
    @Scheduled(fixedDelayString = "${pricing.scheduler.clearance-interval-ms:600000}")
    public void checkClearancePricing() {
        if (!pricingEnabled) return;

        List<SuKien> suKienDangBan = getSuKienDangBan();
        log.debug("[PricingScheduler] Kiểm tra Clearance cho {} sự kiện", suKienDangBan.size());

        for (SuKien sk : suKienDangBan) {
            try {
                pricingService.checkAndApplyClearance(sk.getMaSuKien());
            } catch (Exception e) {
                log.warn("[PricingScheduler] Lỗi check Clearance cho sự kiện {}: {}",
                        sk.getMaSuKien(), e.getMessage());
            }
        }
    }

    /**
     * Lấy danh sách sự kiện đang trong giai đoạn mở bán:
     * - Trạng thái "Hoạt động"
     * - Chưa bắt đầu diễn ra (thoiGianBatDau > today)
     */
    private List<SuKien> getSuKienDangBan() {
        return suKienRepository.findAll().stream()
                .filter(sk -> "Hoạt động".equals(sk.getTrangThai()))
                .filter(sk -> sk.getThoiGianBatDau() != null
                           && sk.getThoiGianBatDau().isAfter(LocalDate.now()))
                .toList();
    }
}
