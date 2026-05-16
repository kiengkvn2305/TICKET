package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "VOUCHER")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "voucher_seq")
    @SequenceGenerator(name = "voucher_seq", sequenceName = "VOUCHER_SEQ", allocationSize = 1)
    private Long maVoucher;

    private String maCode;
    private String dieuKien;
    private Double mucKhuyenMai;
    private String trangThai;
    private Integer luotSuDung;
    private Long maCongTy;

    public Voucher() {
    }

    public Long getMaVoucher() {
        return maVoucher;
    }

    public void setMaVoucher(Long maVoucher) {
        this.maVoucher = maVoucher;
    }

    public String getMaCode() {
        return maCode;
    }

    public void setMaCode(String maCode) {
        this.maCode = maCode;
    }

    public String getDieuKien() {
        return dieuKien;
    }

    public void setDieuKien(String dieuKien) {
        this.dieuKien = dieuKien;
    }

    public Double getMucKhuyenMai() {
        return mucKhuyenMai;
    }

    public void setMucKhuyenMai(Double mucKhuyenMai) {
        this.mucKhuyenMai = mucKhuyenMai;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public Integer getLuotSuDung() {
        return luotSuDung;
    }

    public void setLuotSuDung(Integer luotSuDung) {
        this.luotSuDung = luotSuDung;
    }

    public Long getMaCongTy() {
        return maCongTy;
    }

    public void setMaCongTy(Long maCongTy) {
        this.maCongTy = maCongTy;
    }
}