package com.example.ticket.dto.request;

import java.util.List;

/**
 * Frontend gửi lên khi khách hàng bấm "Xác nhận mua".
 * Thay thế ChiTietHoaDonRequest cũ — tạo HoaDon + nhiều ChiTietHoaDon trong 1 request.
 */
public class MuaVeRequest {

    private Long   maTaiKhoan;  // dùng để tìm KhachHang
    private Long   maSuKien;    // chỉ để log, không bắt buộc
    private String maVoucher;   // nullable — mã giảm giá

    private List<ItemRequest> items;

    public static class ItemRequest {
        private Long maVe;
        private int  soLuong;
        private double donGia;

        public Long   getMaVe()             { return maVe; }
        public void   setMaVe(Long v)       { this.maVe = v; }
        public int    getSoLuong()          { return soLuong; }
        public void   setSoLuong(int v)     { this.soLuong = v; }
        public double getDonGia()           { return donGia; }
        public void   setDonGia(double v)   { this.donGia = v; }
    }

    public Long   getMaTaiKhoan()           { return maTaiKhoan; }
    public void   setMaTaiKhoan(Long v)     { this.maTaiKhoan = v; }
    public Long   getMaSuKien()             { return maSuKien; }
    public void   setMaSuKien(Long v)       { this.maSuKien = v; }
    public String getMaVoucher()            { return maVoucher; }
    public void   setMaVoucher(String v)    { this.maVoucher = v; }
    public List<ItemRequest> getItems()     { return items; }
    public void   setItems(List<ItemRequest> v) { this.items = v; }
}