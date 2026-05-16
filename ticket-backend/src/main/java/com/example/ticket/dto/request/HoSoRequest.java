package com.example.ticket.dto.request;

public class HoSoRequest {

    // KhachHang
    private String tenKhachHang;

    // NhaToChuc
    private String tenCongTy;
    private String tenNguoiDaiDien;
    private String diaChi;

    // Chung
    private String email;
    private String soDienThoai;

    public String getTenKhachHang()           { return tenKhachHang; }
    public void setTenKhachHang(String v)     { this.tenKhachHang = v; }
    public String getTenCongTy()              { return tenCongTy; }
    public void setTenCongTy(String v)        { this.tenCongTy = v; }
    public String getTenNguoiDaiDien()        { return tenNguoiDaiDien; }
    public void setTenNguoiDaiDien(String v)  { this.tenNguoiDaiDien = v; }
    public String getDiaChi()                 { return diaChi; }
    public void setDiaChi(String v)           { this.diaChi = v; }
    public String getEmail()                  { return email; }
    public void setEmail(String v)            { this.email = v; }
    public String getSoDienThoai()            { return soDienThoai; }
    public void setSoDienThoai(String v)      { this.soDienThoai = v; }
}