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
}