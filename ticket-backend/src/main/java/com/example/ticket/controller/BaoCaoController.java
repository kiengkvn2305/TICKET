package com.example.ticket.controller;

import com.example.ticket.dto.response.BaoCaoResponse;
import com.example.ticket.service.BaoCaoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/baocao")
public class BaoCaoController {

    private final BaoCaoService baoCaoService;

    public BaoCaoController(BaoCaoService baoCaoService) {
        this.baoCaoService = baoCaoService;
    }

    /**
     * POST /baocao/ket-so?maNhanVien=1&ngay=2026-05-23
     * Kết sổ cuối ngày — nhân viên bấm nút "Kết sổ"
     */
    @PostMapping("/ket-so")
    public ResponseEntity<BaoCaoResponse> ketSo(
            @RequestParam Long maNhanVien,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngay) {

        if (ngay == null) ngay = LocalDate.now();
        return ResponseEntity.ok(baoCaoService.ketSoCuoiNgay(maNhanVien, ngay));
    }

    /**
     * GET /baocao/nhan-vien/{maNhanVien}
     * Lấy toàn bộ lịch sử báo cáo của nhân viên
     */
    @GetMapping("/nhan-vien/{maNhanVien}")
    public ResponseEntity<List<BaoCaoResponse>> getByNhanVien(
            @PathVariable Long maNhanVien) {
        return ResponseEntity.ok(baoCaoService.getBaoCaoByNhanVien(maNhanVien));
    }

    /**
     * GET /baocao/nhan-vien/{maNhanVien}/range?from=2026-05-01&to=2026-05-31
     * Lấy báo cáo theo khoảng thời gian
     */
    @GetMapping("/nhan-vien/{maNhanVien}/range")
    public ResponseEntity<List<BaoCaoResponse>> getByRange(
            @PathVariable Long maNhanVien,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(baoCaoService.getBaoCaoByRange(maNhanVien, from, to));
    }
}