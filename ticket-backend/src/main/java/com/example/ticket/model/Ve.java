package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "VE")
public class Ve {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ve_seq")
    @SequenceGenerator(name = "ve_seq", sequenceName = "VE_SEQ", allocationSize = 1)
    private Long maVe;

    private String tenVe;
    private String loaiVe;
    private double gia;
    private String trangThai;
    private String moTa;
    private int    soLuong;   // tổng số vé tối đa
    private Long   maSuKien;

    public Long getMaVe() {
        return maVe;
    }

    public void setMaVe(Long maVe) {
        this.maVe = maVe;
    }

    public String getTenVe() {
        return tenVe;
    }

    public void setTenVe(String tenVe) {
        this.tenVe = tenVe;
    }

    public String getLoaiVe() {
        return loaiVe;
    }

    public void setLoaiVe(String loaiVe) {
        this.loaiVe = loaiVe;
    }

    public double getGia() {
        return gia;
    }

    public void setGia(double gia) {
        this.gia = gia;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public Long getMaSuKien() {
        return maSuKien;
    }

    public void setMaSuKien(Long maSuKien) {
        this.maSuKien = maSuKien;
    }
}