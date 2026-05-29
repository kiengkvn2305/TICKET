package com.example.ticket.controller;

import java.util.List;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.ticket.dto.response.GheHoldResponse;
import com.example.ticket.model.Ghe;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.GheRepository;
import com.example.ticket.repository.VeRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.service.GheService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ghe")
public class GheController {

    private final GheRepository gheRepository;
    private final VeRepository  veRepository;
    private final GheService    gheService;
    private final SuKienRepository suKienRepository;

    public GheController(GheRepository gheRepository,
                         VeRepository veRepository,
                         GheService gheService,
                         SuKienRepository suKienRepository) {
        this.gheRepository = gheRepository;
        this.veRepository  = veRepository;
        this.gheService    = gheService;
        this.suKienRepository = suKienRepository;
    }

    // ══ ENDPOINT CŨ — GIỮ NGUYÊN ═══════════════════════════════════════════

    /**
     * Ghế đã đặt (DA_DAT) theo sự kiện — render sơ đồ ghế.
     * GET /api/ghe/sukien/{maSuKien}
     */
    @GetMapping("/sukien/{maSuKien}")
    public ResponseEntity<List<Ghe>> getGheBySuKien(@PathVariable Long maSuKien) {
        List<Long> maVeList = veRepository.findByMaSuKien(maSuKien)
                .stream().map(Ve::getMaVe).toList();
        if (maVeList.isEmpty()) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(gheRepository.findByMaVeIn(maVeList));
    }

    /**
     * GET /api/ghe?maVe=1&maHoaDon=2
     */
    @GetMapping
    public ResponseEntity<List<Ghe>> getGheByVeAndHoaDon(
            @RequestParam Long maVe,
            @RequestParam Long maHoaDon) {
        return ResponseEntity.ok(gheRepository.findByMaVeAndMaHoaDon(maVe, maHoaDon));
    }

    // ══ ENDPOINT MỚI — GIỮ GHẾ IN-MEMORY ══════════════════════════════════

    /**
     * Giữ ghế trước khi thanh toán (tối đa 10 phút).
     */
    @PutMapping("/giu")
    public ResponseEntity<GheHoldResponse> giuGhe(
            @RequestParam Long   maSuKien,
            @RequestParam String khuVuc,
            @RequestParam Long   maTaiKhoan) {
        return ResponseEntity.ok(gheService.giuGhe(maSuKien, khuVuc, maTaiKhoan));
    }

    /**
     * Hủy giữ ghế (khách bấm hủy / đóng modal).
     */
    @PutMapping("/huy-giu")
    public ResponseEntity<GheHoldResponse> huyGiuGhe(
            @RequestParam Long   maSuKien,
            @RequestParam String khuVuc,
            @RequestParam Long   maTaiKhoan) {
        return ResponseEntity.ok(gheService.huyGiuGhe(maSuKien, khuVuc, maTaiKhoan));
    }

    /**
     * Danh sách khuVuc đang bị giữ trong sự kiện.
     */
    @GetMapping("/dang-giu")
    public ResponseEntity<Set<String>> getDanhSachDangGiu(
            @RequestParam Long maSuKien) {
        return ResponseEntity.ok(gheService.getDanhSachDangGiu(maSuKien));
    }

    /**
     * POST /api/ghe/checkin?ticketCode=TK-3-1-1
     * Thực hiện check-in vé bằng mã QR.
     */
    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestParam String ticketCode) {
        if (ticketCode == null || ticketCode.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mã QR vé không được để trống."));
        }
        
        String cleanCode = ticketCode.trim();
        if (!cleanCode.toUpperCase().startsWith("TK-")) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mã QR không đúng định dạng vé hệ thống."));
        }
        
        String[] parts = cleanCode.split("-");
        if (parts.length != 4) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mã QR vé không hợp lệ hoặc sai cấu trúc."));
        }
        
        try {
            Long maHoaDon = Long.parseLong(parts[1]);
            Long maVe = Long.parseLong(parts[2]);
            int idx = Integer.parseInt(parts[3]);
            
            List<Ghe> ghes = gheRepository.findByMaVeAndMaHoaDon(maVe, maHoaDon);
            if (ghes.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Không tìm thấy vé trong hệ thống."));
            }
            
            // Sắp xếp theo maGhe để đảm bảo thứ tự khớp tuyệt đối với lúc xuất vé
            ghes.sort(java.util.Comparator.comparing(Ghe::getMaGhe));
            
            if (idx < 1 || idx > ghes.size()) {
                return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "Mã vé #" + idx + " không tồn tại trong hóa đơn này (tối đa " + ghes.size() + " vé)."
                ));
            }
            
            Ghe ghe = ghes.get(idx - 1);
            String currentStatus = ghe.getTrangThai() != null ? ghe.getTrangThai().toLowerCase() : "";
            
            if ("da_hoan".equals(currentStatus)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Vé này đã được hoàn trả thành công trước đó. Không thể check-in!"));
            }
            
            if ("da_checkin".equals(currentStatus)) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "Vé này đã được quét check-in trước đó!"));
            }
            
            // Thực hiện chuyển trạng thái thành da_checkin
            ghe.setTrangThai("da_checkin");
            gheRepository.save(ghe);
            
            // Lấy thông tin bổ sung để hiển thị cho nhân viên kiểm soát vé
            String tenVe = "—";
            String tenSuKien = "—";
            Ve ve = veRepository.findById(maVe).orElse(null);
            if (ve != null) {
                tenVe = ve.getTenVe();
                if (ve.getMaSuKien() != null) {
                    com.example.ticket.model.SuKien sk = suKienRepository.findById(ve.getMaSuKien()).orElse(null);
                    if (sk != null) {
                        tenSuKien = sk.getTenSuKien();
                    }
                }
            }
            
            return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Check-in thành công!",
                "ticketCode", cleanCode,
                "maGhe", ghe.getMaGhe(),
                "khuVuc", ghe.getKhuVuc() != null ? ghe.getKhuVuc() : "Tự do",
                "tenVe", tenVe,
                "tenSuKien", tenSuKien
            ));
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Mã QR chứa các thông số không hợp lệ."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", "Lỗi hệ thống: " + e.getMessage()));
        }
    }
}