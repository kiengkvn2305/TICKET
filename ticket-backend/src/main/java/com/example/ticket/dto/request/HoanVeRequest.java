package com.example.ticket.dto.request;

public class HoanVeRequest {
    private Long maHoaDon;
    private Long maVe;
    private int  soLuongHoan;
    private String lyDoHoan;

    public Long getMaHoaDon()           { return maHoaDon; }
    public void setMaHoaDon(Long v)     { this.maHoaDon = v; }
    public Long getMaVe()               { return maVe; }
    public void setMaVe(Long v)         { this.maVe = v; }
    public int  getSoLuongHoan()        { return soLuongHoan; }
    public void setSoLuongHoan(int v)   { this.soLuongHoan = v; }
    public String getLyDoHoan()         { return lyDoHoan; }
    public void setLyDoHoan(String v)   { this.lyDoHoan = v; }
}
