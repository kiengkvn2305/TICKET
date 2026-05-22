package com.example.ticket.controller;

import com.example.ticket.dto.request.VoucherRequest;
import com.example.ticket.dto.response.VoucherResponse;
import com.example.ticket.service.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voucher")
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    // Tra cứu voucher theo mã code — dùng cho frontend preview giảm giá
    @GetMapping("/code/{maCode}")
    public ResponseEntity<VoucherResponse> getByCode(@PathVariable String maCode) {
        return ResponseEntity.ok(voucherService.getByCode(maCode));
    }

    // Lấy danh sách voucher theo nhà tổ chức (dùng maTaiKhoan làm key)
    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<VoucherResponse>> getByCreator(
            @PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(voucherService.getByCreator(maTaiKhoan));
    }

    // Lấy chi tiết 1 voucher
    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.getById(id));
    }

    // Tạo voucher mới
    @PostMapping
    public ResponseEntity<VoucherResponse> create(
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.create(request));
    }

    // Cập nhật voucher
    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponse> update(
            @PathVariable Long id,
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.update(id, request));
    }

    // Xóa voucher
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/sukien/{maSuKien}")
    public ResponseEntity<List<VoucherResponse>> getBySuKien(@PathVariable Long maSuKien) {
        return ResponseEntity.ok(voucherService.getBySuKien(maSuKien));
    }

    @GetMapping("/code/{maCode}/sukien/{maSuKien}")
    public ResponseEntity<VoucherResponse> getByCodeAndSuKien(
            @PathVariable String maCode, @PathVariable Long maSuKien) {
        return ResponseEntity.ok(voucherService.getByCodeAndSuKien(maCode, maSuKien));
    }

    // Gọi khi khách hàng / nhân viên xác nhận dùng voucher
    @PatchMapping("/{id}/use")
    public ResponseEntity<VoucherResponse> useVoucher(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.useVoucher(id));
    }
}