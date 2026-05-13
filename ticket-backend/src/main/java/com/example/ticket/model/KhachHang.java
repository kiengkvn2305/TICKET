package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "KHACHHANG")

public class KhachHang{
    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "kh_seq"
    )

    @SequenceGenerator(
        name = "kh_seq",
        sequenceName = "KHACHHANG_SEQ",
        allocationSize = 1
    )
    private Long maKhachHang;
    
    private String tenKhachHang;
    private String email;
    private String soDienThoai;
    private Long maTaiKhoan;
    
    public KhachHang() {

    }

    public Long getMaTaiKhoan() {
        return maTaiKhoan;
    }

    public void setMaTaiKhoan(Long maTaiKhoan) {
        this.maTaiKhoan = maTaiKhoan;
    }
}