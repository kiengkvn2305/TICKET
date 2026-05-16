package com.example.ticket.service;

import com.example.ticket.dto.request.*;
import com.example.ticket.dto.response.*;

import java.util.List;

public interface TaiKhoanService {
    LoginResponse login(LoginRequest request);
    void register(RegisterRequest request);
    TaiKhoanResponse getById(Long id);
    List<TaiKhoanResponse> getAll();
    TaiKhoanResponse update(Long id, UpdateTaiKhoanRequest request);
    void delete(Long id);
    void forgetPassword(String tenDangNhap);

    // Ngày 1: thêm mới
    void doiMatKhau(Long id, DoiMatKhauRequest request);
    HoSoResponse getHoSo(Long id);
    HoSoResponse updateHoSo(Long id, HoSoRequest request);
}