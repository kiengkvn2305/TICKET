package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "SUKIEN")
public class SuKien {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sukien_seq")
    @SequenceGenerator(name = "sukien_seq", sequenceName = "SUKIEN_SEQ", allocationSize = 1)
    @Column(name = "MASUKIEN")
    private Long maSuKien;

    @Column(name = "TENSUKIEN", nullable = false)
    private String tenSuKien;

    @Column(name = "MOTA")
    private String moTa;

    @Column(name = "THOIGIANBATDAU")
    private LocalDate thoiGianBatDau;

    @Column(name = "THOIGIANKETTHUC")
    private LocalDate thoiGianKetThuc;

    @Column(name = "MACONGTY")
    private Long maCongTy;

    public SuKien() {}

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
