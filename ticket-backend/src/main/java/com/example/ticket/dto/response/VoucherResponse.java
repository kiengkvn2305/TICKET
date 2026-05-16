package com.example.ticket.dto.response;

import java.time.LocalDate;

public class VoucherResponse {

    private Long maVoucher;
    private String maCode;
    private String dieuKien;
    private Double mucKhuyenMai;
    private String trangThai;
    private Integer luotSuDung;
    private Long maCongTy;
    private Long maSuKien;
    private String tenSuKien;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;

    public Long getMaVoucher() { return maVoucher; }
    public void setMaVoucher(Long maVoucher) { this.maVoucher = maVoucher; }

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

    public Long getMaCongTy() { return maCongTy; }
    public void setMaCongTy(Long maCongTy) { this.maCongTy = maCongTy; }

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }

    public String getTenSuKien() { return tenSuKien; }
    public void setTenSuKien(String tenSuKien) { this.tenSuKien = tenSuKien; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }
}
