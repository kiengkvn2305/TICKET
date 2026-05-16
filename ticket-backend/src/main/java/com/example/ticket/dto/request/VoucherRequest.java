package com.example.ticket.dto.request;

public class VoucherRequest {
    private String maCode;
    private String dieuKien;
    private Double mucKhuyenMai;
    private String trangThai;
    private Integer luotSuDung;
    private Long maTaiKhoan; // dùng để tra cứu maCongTy

    public String getMaCode(){
        return maCode; 
    }
    
    public void setMaCode(String v){
        this.maCode = v; 
    }
    
    public String getDieuKien(){ 
        return dieuKien; 
    }
    
    public void setDieuKien(String v){
        this.dieuKien = v; 
    }
    
    public Double getMucKhuyenMai(){ 
        return mucKhuyenMai; 
    }
    
    public void setMucKhuyenMai(Double v){ 
        this.mucKhuyenMai = v; 
    }
    
    public String getTrangThai(){ 
        return trangThai; 
    }
    
    public void setTrangThai(String v){ 
        this.trangThai = v; 
    }
    
    public Integer getLuotSuDung(){ 
        return luotSuDung; 
    }
    
    public void setLuotSuDung(Integer v){ 
        this.luotSuDung = v; 
    }
    
    public Long getMaTaiKhoan(){ 
        return maTaiKhoan; 
    }
    public void setMaTaiKhoan(Long v)    { 
        this.maTaiKhoan = v; 
    }
}