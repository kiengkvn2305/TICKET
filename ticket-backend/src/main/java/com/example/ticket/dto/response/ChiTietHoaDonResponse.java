package com.example.ticket.dto.response;

public class ChiTietHoaDonResponse {

    private long maVe;
    private long maHoaDon;
    private long donGia;
    private int soLuong;

    public long getMaVe() {
        return maVe;
    }

    public void setMaVe(long maVe) {
        this.maVe = maVe;
    }

    public long getMaHoaDon() {
        return maHoaDon;
    }

    public void setMaHoaDon(long maHoaDon) {
        this.maHoaDon = maHoaDon;
    }

    public long getDonGia() {
        return donGia;
    }

    public void setDonGia(long donGia) {
        this.donGia = donGia;
    }

    public int getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(int soLuong) {
        this.soLuong = soLuong;
    }
}
