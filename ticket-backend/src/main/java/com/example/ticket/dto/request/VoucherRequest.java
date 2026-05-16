package com.example.ticket.dto.request;

import java.time.LocalDate;

public class VoucherRequest {

    private String maCode;
    private String dieuKien;
    private Double mucKhuyenMai;
    private String trangThai;
    private Integer luotSuDung;
    private Long maTaiKhoan;
    private Long maSuKien;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;

    public String getMaCode() { return maCode; }
    public void setMaCode(String maCode) { this.maCode = maCode; }

    public String getDieuKien() { return dieuKien; }
    public void setDieuKien(String dieuKien) { this.dieuKien = dieuKien; }

    public Double getMucKhuyenMai() { return mucKhuyenMai; }
    public void setMucKhuyenMai(Double mucKhuyenMai) { this.mucKhuyenMai = mucKhuyenMai; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public Integer getLuotSuDung() { return luotSuDung; }
    public void setLuotSuDung(Integer luotSuDung) { this.luotSuDung = luotSuDung; }

    public Long getMaTaiKhoan() { return maTaiKhoan; }
    public void setMaTaiKhoan(Long maTaiKhoan) { this.maTaiKhoan = maTaiKhoan; }

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }
}
