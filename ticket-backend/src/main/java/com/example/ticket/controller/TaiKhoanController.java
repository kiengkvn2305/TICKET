package com.example.ticket.controller;

import com.example.ticket.dto.request.LoginRequest;
import com.example.ticket.dto.request.RegisterRequest;
import com.example.ticket.dto.request.UpdateTaiKhoanRequest;
import com.example.ticket.dto.response.LoginResponse;
import com.example.ticket.dto.response.TaiKhoanResponse;
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

    // BUG FIX: frontend gọi endpoint này nhưng chưa tồn tại → 404
    @PostMapping("/forget-password")
    public ResponseEntity<String> forgetPassword(@RequestBody LoginRequest request) {
        service.forgetPassword(request.getTenDangNhap());
        return ResponseEntity.ok("Yêu cầu đặt lại mật khẩu đã được ghi nhận. Vui lòng liên hệ quản trị viên.");
    }
}