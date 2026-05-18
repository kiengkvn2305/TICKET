package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "HOANVE")
public class HoanVe {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hoanve_seq")
    @SequenceGenerator(name = "hoanve_seq", sequenceName = "HOANVE_SEQ", allocationSize = 1)
    private Long maHoanVe;

    private Long maHoaDon;
    private Long maVe;
    private LocalDate thoiGianHoan;
    private int soLuongHoan;
    private String lyDoHoan;
    private String trangThaiHoan;

    public Long getMaHoanVe() { return maHoanVe; }
    public void setMaHoanVe(Long maHoanVe) { this.maHoanVe = maHoanVe; }
    public Long getMaHoaDon() { return maHoaDon; }
    public void setMaHoaDon(Long v) { this.maHoaDon = v; }
    public Long getMaVe() { return maVe; }
    public void setMaVe(Long v) { this.maVe = v; }

    public LocalDate getThoiGianHoan() {
        return thoiGianHoan;
    }

    public void setThoiGianHoan(LocalDate thoiGianHoan) {
        this.thoiGianHoan = thoiGianHoan;
    }

    public int getSoLuongHoan() {
        return soLuongHoan;
    }

    public void setSoLuongHoan(int soLuongHoan) {
        this.soLuongHoan = soLuongHoan;
    }

    public String getLyDoHoan() {
        return lyDoHoan;
    }

    public void setLyDoHoan(String lyDoHoan) {
        this.lyDoHoan = lyDoHoan;
    }

    public String getTrangThaiHoan() {
        return trangThaiHoan;
    }

    public void setTrangThaiHoan(String trangThaiHoan) {
        this.trangThaiHoan = trangThaiHoan;
    }
}
