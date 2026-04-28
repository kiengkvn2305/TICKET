package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "KHACHHANG")

public class KhachHang{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long maKhachHang;
    
    private String tenKhachHang;
    private String email;
    private String soDienThoai;
}