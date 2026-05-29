package com.example.ticket.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

/**
 * Bảng SUKIEN — thêm các cột cấu hình định giá động:
 *  - cauHinhGamma   : Hệ số đột phá FOMO cho sự kiện này (ghi đè global default).
 *  - ngayXaHang     : Ngưỡng ngày sát sự kiện kích hoạt Bậc Giải cứu.
 *  - ngayMoBan      : Ngày bắt đầu mở bán vé (dùng tính T_total / T_passed).
 *  - dinhGiaDongBat : false = tắt định giá động cho sự kiện này.
 */
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

    /** Địa điểm tổ chức — liên kết tới DiaDiem.maDiaDiem */
    @Column(name = "MADIADIEM")
    private Long maDiaDiem;

    /**
     * Trạng thái admin quản lý: "Hoạt động" | "Vi phạm" | "Ẩn"
     * Mặc định "Hoạt động" khi tạo mới.
     */
    @Column(name = "TRANGTHAI")
    private String trangThai = "Hoạt động";

    // ── Cấu hình Định giá Động ───────────────────────────────────────────────

    /**
     * Hệ số Gamma (γ) cho sự kiện này.
     * null → dùng global default từ application.properties (pricing.gamma.default).
     */
    @Column(name = "CAU_HINH_GAMMA")
    private Double cauHinhGamma;

    /**
     * Số ngày còn lại trước sự kiện để kích hoạt Bậc Giải cứu.
     * null → dùng global default (pricing.clearance.days-before-event).
     */
    @Column(name = "NGAY_XA_HANG")
    private Integer ngayXaHang;

    /**
     * Ngày bắt đầu mở bán vé — dùng để tính T_total và T_passed.
     * Nếu null → mặc định dùng ngày tạo sự kiện.
     */
    @Column(name = "NGAY_MO_BAN")
    private LocalDate ngayMoBan;

    /**
     * Bật/tắt định giá động riêng cho sự kiện này.
     * Mặc định true — kế thừa global config pricing.enabled.
     */
    @Column(name = "DINH_GIA_DONG_BAT")
    private Boolean dinhGiaDongBat = true;

    public SuKien() {}

    // ── getters / setters ────────────────────────────────────────────────────

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }

    public String getTenSuKien() { return tenSuKien; }
    public void setTenSuKien(String tenSuKien) { this.tenSuKien = tenSuKien; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public LocalDate getThoiGianBatDau() { return thoiGianBatDau; }
    public void setThoiGianBatDau(LocalDate thoiGianBatDau) { this.thoiGianBatDau = thoiGianBatDau; }

    public LocalDate getThoiGianKetThuc() { return thoiGianKetThuc; }
    public void setThoiGianKetThuc(LocalDate thoiGianKetThuc) { this.thoiGianKetThuc = thoiGianKetThuc; }

    public Long getMaCongTy() { return maCongTy; }
    public void setMaCongTy(Long maCongTy) { this.maCongTy = maCongTy; }

    public Long getMaDiaDiem() { return maDiaDiem; }
    public void setMaDiaDiem(Long maDiaDiem) { this.maDiaDiem = maDiaDiem; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public Double getCauHinhGamma() { return cauHinhGamma; }
    public void setCauHinhGamma(Double cauHinhGamma) { this.cauHinhGamma = cauHinhGamma; }

    public Integer getNgayXaHang() { return ngayXaHang; }
    public void setNgayXaHang(Integer ngayXaHang) { this.ngayXaHang = ngayXaHang; }

    public LocalDate getNgayMoBan() { return ngayMoBan; }
    public void setNgayMoBan(LocalDate ngayMoBan) { this.ngayMoBan = ngayMoBan; }

    public Boolean getDinhGiaDongBat() { return dinhGiaDongBat; }
    public void setDinhGiaDongBat(Boolean dinhGiaDongBat) { this.dinhGiaDongBat = dinhGiaDongBat; }
}