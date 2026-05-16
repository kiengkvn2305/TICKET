package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "THANHTOAN")
public class ThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "thanhtoan_seq")
    @SequenceGenerator(name = "thanhtoan_seq", sequenceName = "THANHTOAN_SEQ", allocationSize = 1)
    private Long maThanhToan;

    private String trangThai;
    private Long soTien;
    private LocalDateTime thoiGian;
    private String phuongThuc;

    public Long getMaThanhToan() {
        return maThanhToan;
    }

    public void setMaThanhToan(Long maThanhToan) {
        this.maThanhToan = maThanhToan;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public Long getSoTien() {
        return soTien;
    }

    public void setSoTien(Long soTien) {
        this.soTien = soTien;
    }

    public LocalDateTime getThoiGian() {
        return thoiGian;
    }

    public void setThoiGian(LocalDateTime thoiGian) {
        this.thoiGian = thoiGian;
    }

    public String getPhuongThuc() {
        return phuongThuc;
    }

    public void setPhuongThuc(String phuongThuc) {
        this.phuongThuc = phuongThuc;
    }
}
