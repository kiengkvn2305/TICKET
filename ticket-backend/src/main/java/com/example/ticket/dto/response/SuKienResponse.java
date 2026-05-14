package com.example.ticket.dto.response;

import java.time.LocalDate;

public class SuKienResponse {

    private Long maSuKien;

    private String tenSuKien;

    private String moTa;

    private LocalDate thoiGianBatDau;

    private LocalDate thoiGianKetThuc;

    private Long maCongTy;

    public SuKienResponse() {
    }

    public Long getMaSuKien() {
        return maSuKien;
    }

    public void setMaSuKien(Long maSuKien) {
        this.maSuKien = maSuKien;
    }

    public String getTenSuKien() {
        return tenSuKien;
    }

    public void setTenSuKien(String tenSuKien) {
        this.tenSuKien = tenSuKien;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public LocalDate getThoiGianBatDau() {
        return thoiGianBatDau;
    }

    public void setThoiGianBatDau(LocalDate thoiGianBatDau) {
        this.thoiGianBatDau = thoiGianBatDau;
    }

    public LocalDate getThoiGianKetThuc() {
        return thoiGianKetThuc;
    }

    public void setThoiGianKetThuc(LocalDate thoiGianKetThuc) {
        this.thoiGianKetThuc = thoiGianKetThuc;
    }

    public Long getMaCongTy() {
        return maCongTy;
    }

    public void setMaCongTy(Long maCongTy) {
        this.maCongTy = maCongTy;
    }
}