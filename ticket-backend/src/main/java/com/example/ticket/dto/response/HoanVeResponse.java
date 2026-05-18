package com.example.ticket.dto.response;

import java.time.LocalDate;

public class HoanVeResponse {
    private Long      maHoanVe;
    private Long      maHoaDon;
    private Long      maVe;
    private LocalDate thoiGianHoan;
    private int       soLuongHoan;
    private String    lyDoHoan;
    private String    trangThaiHoan;

    public Long      getMaHoanVe()                  { return maHoanVe; }
    public void      setMaHoanVe(Long v)             { this.maHoanVe = v; }
    public Long      getMaHoaDon()                   { return maHoaDon; }
    public void      setMaHoaDon(Long v)             { this.maHoaDon = v; }
    public Long      getMaVe()                       { return maVe; }
    public void      setMaVe(Long v)                 { this.maVe = v; }
    public LocalDate getThoiGianHoan()               { return thoiGianHoan; }
    public void      setThoiGianHoan(LocalDate v)    { this.thoiGianHoan = v; }
    public int       getSoLuongHoan()                { return soLuongHoan; }
    public void      setSoLuongHoan(int v)           { this.soLuongHoan = v; }
    public String    getLyDoHoan()                   { return lyDoHoan; }
    public void      setLyDoHoan(String v)           { this.lyDoHoan = v; }
    public String    getTrangThaiHoan()              { return trangThaiHoan; }
    public void      setTrangThaiHoan(String v)      { this.trangThaiHoan = v; }
}
