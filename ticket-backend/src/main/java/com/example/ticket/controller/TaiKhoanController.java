package com.example.ticket.controller;

import com.example.ticket.dto.request.*;
import com.example.ticket.dto.response.*;
import com.example.ticket.service.TaiKhoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/taikhoan")
public class TaiKhoanController {

    private final TaiKhoanService service;

    public TaiKhoanController(TaiKhoanService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TaiKhoanResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaiKhoanResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest request) {
        service.register(request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaiKhoanResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateTaiKhoanRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forget-password")
    public ResponseEntity<String> forgetPassword(@RequestBody LoginRequest request) {
        service.forgetPassword(request.getTenDangNhap());
        return ResponseEntity.ok("Mật khẩu đã được đặt lại về 123456. Vui lòng đổi mật khẩu sau khi đăng nhập.");
    }

    @PostMapping("/{id}/doi-mat-khau")
    public ResponseEntity<Void> doiMatKhau(
            @PathVariable Long id,
            @RequestBody DoiMatKhauRequest request) {
        service.doiMatKhau(id, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/ho-so")
    public ResponseEntity<HoSoResponse> getHoSo(@PathVariable Long id) {
        return ResponseEntity.ok(service.getHoSo(id));
    }

    @PutMapping("/{id}/ho-so")
    public ResponseEntity<HoSoResponse> updateHoSo(
            @PathVariable Long id,
            @RequestBody HoSoRequest request) {
        return ResponseEntity.ok(service.updateHoSo(id, request));
    }

    // ── Admin: quản lý tài khoản ─────────────────────────────────────────────

    @PutMapping("/{id}/block")
    public ResponseEntity<Void> block(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String lyDo = body != null ? body.getOrDefault("lyDo", "Vi phạm chính sách") : "Vi phạm chính sách";
        service.block(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/unblock")
    public ResponseEntity<Void> unblock(@PathVariable Long id) {
        service.unblock(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ THÊM: endpoint reset mật khẩu cho admin
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        service.resetPassword(id, body.get("matKhauMoi"));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Void> changeRole(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        service.changeRole(id, body.get("loaiTaiKhoan"));
        return ResponseEntity.noContent().build();
    }
}