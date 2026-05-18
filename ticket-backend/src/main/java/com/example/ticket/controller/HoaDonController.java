package com.example.ticket.controller;

import com.example.ticket.dto.request.MuaVeRequest;
import com.example.ticket.dto.response.MuaVeResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;
import com.example.ticket.service.HoaDonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/hoadon")
public class HoaDonController {

    private final HoaDonService service;

    public HoaDonController(HoaDonService service) {
        this.service = service;
    }

    /**
     * Mua vé — tạo HoaDon + ChiTietHoaDon trong 1 request.
     * Body: { maTaiKhoan, maSuKien, maVoucher?, items:[{maVe, soLuong, donGia}] }
     */
    @PostMapping("/mua")
    public ResponseEntity<MuaVeResponse> muaVe(@RequestBody MuaVeRequest request) {
        return ResponseEntity.ok(service.muaVe(request));
    }

    /**
     * Lấy tất cả vé đã mua của khách hàng (theo maTaiKhoan).
     * Dùng cho tab "Vé của tôi".
     */
    @GetMapping("/khachhang/{maTaiKhoan}")
    public ResponseEntity<List<VeKhachHangResponse>> getVeByKhachHang(
            @PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(service.getVeByKhachHang(maTaiKhoan));
    }
}