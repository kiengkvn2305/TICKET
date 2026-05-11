package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "TAIKHOAN")

public class TaiKhoan {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tk_seq")
    @SequenceGenerator(
        name = "tk_seq",
        sequenceName = "TAIKHOAN_SEQ",
        allocationSize = 1
    )
    private Long maTaiKhoan;
    
    private String tenTaiKhoan;
    private String loaiTaiKhoan;
    private String matKhau;
    
    public TaiKhoan(){
        
    }
    
    public TaiKhoan(Long maTaiKhoan, String tenTaiKhoan, String loaiTaiKhoan, String matKhau){
        this.maTaiKhoan = maTaiKhoan;
        this.tenTaiKhoan = tenTaiKhoan;
        this.loaiTaiKhoan = loaiTaiKhoan;
        this.matKhau = matKhau;
    }
    public String getTenTaiKhoan(){
        return tenTaiKhoan;
    }
    
    public void setTenTaiKhoan(String tenTaiKhoan){
        this.tenTaiKhoan = tenTaiKhoan;
    }
    
    public long getMaTaiKhoan(){
        return maTaiKhoan;
    }
    
    public void setMaTaiKhoan(Long maTaiKhoan){
        this.maTaiKhoan = maTaiKhoan;
    }
    
    public String getLoaiTaiKhoan(){
        return loaiTaiKhoan;
    }
    
    public void setLoaiTaiKhoan(String loaiTaiKhoan){
        this.loaiTaiKhoan = loaiTaiKhoan;
    }
    
    public String getMatKhau(){
        return matKhau;
    }
    
    public void setMatKhau(String matKhau){
        this.matKhau = matKhau;
    }
    
    @Override
    public String toString() {
        return "TaiKhoan{" +
                "maTaiKhoan=" + maTaiKhoan +
                ", tenTaiKhoan='" + tenTaiKhoan + '\'' +
                ", loaiTaiKhoan='" + loaiTaiKhoan + '\'' +
                '}';
    }
}