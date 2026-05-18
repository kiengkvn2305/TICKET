package com.example.ticket.dto.response;

import java.time.LocalDate;

public class SuKienResponse {

    private Long      maSuKien;
    private String    tenSuKien;
    private String    moTa;
    private LocalDate thoiGianBatDau;
    private LocalDate thoiGianKetThuc;
    private Long      maCongTy;

    /**
     * Trạng thái được tính tự động từ ngày:
     *   "Đang tổ chức"  — hôm nay nằm trong [batDau, ketThuc]
     *   "Đã tổ chức"    — hôm nay sau ketThuc
     *   "Sắp diễn ra"   — hôm nay trước batDau
     *   "Hủy bỏ"        — set thủ công (nếu sau này thêm field hủy vào DB)
     */
    private String trangThai;

    public SuKienResponse() {}

    // ── getters / setters ──────────────────────────────────────────────────

    public Long getMaSuKien()                      { return maSuKien; }
    public void setMaSuKien(Long v)                { this.maSuKien = v; }

    public String getTenSuKien()                   { return tenSuKien; }
    public void   setTenSuKien(String v)           { this.tenSuKien = v; }

    public String getMoTa()                        { return moTa; }
    public void   setMoTa(String v)                { this.moTa = v; }

    public LocalDate getThoiGianBatDau()           { return thoiGianBatDau; }
    public void      setThoiGianBatDau(LocalDate v){ this.thoiGianBatDau = v; }

    public LocalDate getThoiGianKetThuc()            { return thoiGianKetThuc; }
    public void      setThoiGianKetThuc(LocalDate v) { this.thoiGianKetThuc = v; }

    public Long getMaCongTy()                      { return maCongTy; }
    public void setMaCongTy(Long v)                { this.maCongTy = v; }

    public String getTrangThai()                   { return trangThai; }
    public void   setTrangThai(String v)           { this.trangThai = v; }
}