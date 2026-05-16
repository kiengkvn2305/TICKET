package com.example.ticket.service;
import com.example.ticket.model.TaiKhoan;
import com.example.ticket.dto.request.*;
import com.example.ticket.dto.response.*;
import java.util.List;

public interface TaiKhoanService {
    LoginResponse login(LoginRequest request);
    void register(RegisterRequest request);
    TaiKhoanResponse getById(Long id);
    List<TaiKhoanResponse> getAll();
    TaiKhoanResponse update(Long id, UpdateTaiKhoanRequest taiKhoan);
    void delete(Long id);
    // BUG FIX: endpoint /forget-password gọi method này nhưng chưa có trong interface
    void forgetPassword(String tenDangNhap);
}