package com.example.ticket.model;

import jakarta.persistence.*;

/**
 * VE = Hạng vé / Ticket Category (VIP, Thường, ...).
 * Mỗi sự kiện có nhiều hạng vé. Bảng GHE lưu từng ghế đơn lẻ.
 *
 * Các cột định giá động:
 *  - giaGoc      : Giá sàn ban đầu — KHÔNG BAO GIỜ thay đổi sau khi tạo.
 *  - gia         : Giá hiện tại (GIA_HIEN_TAI) — thuật toán cập nhật liên tục.
 *  - heSoNhanGia : Beta hiện tại (1.0 / 1.15 / 1.30 / 1.50 / 0.80).
 */
@Entity
@Table(name = "VE")
public class Ve {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ve_seq")
    @SequenceGenerator(name = "ve_seq", sequenceName = "VE_SEQ", allocationSize = 1)
    private Long maVe;

    private String tenVe;
    private String loaiVe;

    /** GIA_HIEN_TAI — được thuật toán định giá động cập nhật. */
    private double gia;

    /** GIA_GOC — giá sàn bất biến, dùng làm P_base. */
    @Column(name = "GIA_GOC")
    private double giaGoc;

    /** Hệ số nhân giá beta hiện tại (1.0, 1.15, 1.30, 1.50, 0.80). */
    @Column(name = "HE_SO_NHAN_GIA")
    private double heSoNhanGia = 1.0;

    private String trangThai;
    private String moTa;
    private Long   maSuKien;

    @Column(name = "SoLuong")
    private int soLuong;  // V_total: tổng số vé niêm yết

    @Column(name = "DaBan")
    private int daBan;    // số vé đã bán (SOLD)

    // Tính conLai động, không lưu vào DB
    @Transient
    public int getConLai() {
        return soLuong - daBan;
    }

    // ── getters / setters ────────────────────────────────────────────────────

    public Long getMaVe() { return maVe; }
    public void setMaVe(Long maVe) { this.maVe = maVe; }

    public String getTenVe() { return tenVe; }
    public void setTenVe(String tenVe) { this.tenVe = tenVe; }

    public String getLoaiVe() { return loaiVe; }
    public void setLoaiVe(String loaiVe) { this.loaiVe = loaiVe; }

    public double getGia() { return gia; }
    public void setGia(double gia) { this.gia = gia; }

    public double getGiaGoc() { return giaGoc; }
    public void setGiaGoc(double giaGoc) { this.giaGoc = giaGoc; }

    public double getHeSoNhanGia() { return heSoNhanGia; }
    public void setHeSoNhanGia(double heSoNhanGia) { this.heSoNhanGia = heSoNhanGia; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public int getDaBan() { return daBan; }
    public void setDaBan(int daBan) { this.daBan = daBan; }

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }
}