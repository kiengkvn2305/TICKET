package com.example.ticket.dto.response;

import java.time.LocalDate;

/** Trả về cho tab "Vé của tôi" — gộp thông tin Ve + SuKien + HoaDon */
public class VeKhachHangResponse {

    private Long      maVe;
    private String    tenVe;
    private String    loaiVe;
    private double    gia;
    private String    trangThai;
    private String    tenSuKien;
    private LocalDate thoiGianBatDau;
    private LocalDate thoiGianKetThuc;
    private Long      maHoaDon;
    private LocalDate ngayMua;
    private int       soLuong;

    public Long      getMaVe()                   { return maVe; }
    public void      setMaVe(Long v)             { this.maVe = v; }
    public String    getTenVe()                  { return tenVe; }
    public void      setTenVe(String v)          { this.tenVe = v; }
    public String    getLoaiVe()                 { return loaiVe; }
    public void      setLoaiVe(String v)         { this.loaiVe = v; }
    public double    getGia()                    { return gia; }
    public void      setGia(double v)            { this.gia = v; }
    public String    getTrangThai()              { return trangThai; }
    public void      setTrangThai(String v)      { this.trangThai = v; }
    public String    getTenSuKien()              { return tenSuKien; }
    public void      setTenSuKien(String v)      { this.tenSuKien = v; }
    public LocalDate getThoiGianBatDau()         { return thoiGianBatDau; }
    public void      setThoiGianBatDau(LocalDate v) { this.thoiGianBatDau = v; }
    public LocalDate getThoiGianKetThuc()        { return thoiGianKetThuc; }
    public void      setThoiGianKetThuc(LocalDate v){ this.thoiGianKetThuc = v; }
    public Long      getMaHoaDon()               { return maHoaDon; }
    public void      setMaHoaDon(Long v)         { this.maHoaDon = v; }
    public LocalDate getNgayMua()                { return ngayMua; }
    public void      setNgayMua(LocalDate v)     { this.ngayMua = v; }
    public int       getSoLuong()                { return soLuong; }
    public void      setSoLuong(int v)           { this.soLuong = v; }
}