package com.example.ticket.service;

import com.example.ticket.dto.request.MuaVeRequest;
import com.example.ticket.dto.response.MuaVeResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;

import java.util.List;

public interface HoaDonService {
    MuaVeResponse muaVe(MuaVeRequest request);
    List<VeKhachHangResponse> getVeByKhachHang(Long maTaiKhoan);
    List<VeKhachHangResponse> getAllVe();
}