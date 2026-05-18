package com.example.ticket.service;

import com.example.ticket.dto.request.MuaVeRequest;
import com.example.ticket.dto.response.MuaVeResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;

import java.util.List;

public interface HoaDonService {
    /** Tạo HoaDon + ChiTietHoaDon trong 1 transaction, áp dụng voucher nếu có */
    MuaVeResponse muaVe(MuaVeRequest request);

    /** Lấy tất cả vé đã mua của 1 khách hàng (theo maTaiKhoan) */
    List<VeKhachHangResponse> getVeByKhachHang(Long maTaiKhoan);
}