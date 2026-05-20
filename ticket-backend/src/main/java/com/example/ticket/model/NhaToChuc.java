package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "NHATOCHUC")
public class NhaToChuc {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ntc_seq")
    @SequenceGenerator(name = "ntc_seq", sequenceName = "NHATOCHUC_SEQ", allocationSize = 1)
    private Long maCongTy;

    private String tenCongTy;
    private String tenNguoiDaiDien;
    private String diaChi;
    private String email;
    private String soDienThoai;
    private Long maTaiKhoan;
    private String maQR;

    public NhaToChuc() {}

    public Long getMaCongTy() {
        return maCongTy;
    }

    public void setMaCongTy(Long maCongTy) {
        this.maCongTy = maCongTy;
    }

    public String getTenCongTy() {
        return tenCongTy;
    }

    public void setTenCongTy(String tenCongTy) {
        this.tenCongTy = tenCongTy;
    }

    public String getTenNguoiDaiDien() {
        return tenNguoiDaiDien;
    }

    public void setTenNguoiDaiDien(String tenNguoiDaiDien) {
        this.tenNguoiDaiDien = tenNguoiDaiDien;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public Long getMaTaiKhoan() {
        return maTaiKhoan;
    }

    public void setMaTaiKhoan(Long maTaiKhoan) {
        this.maTaiKhoan = maTaiKhoan;
    }
}
