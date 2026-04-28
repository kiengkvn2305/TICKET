package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "NHATOCHUC")
public class NhaToChuc {
    @Id
    private long maCongTy;
    
    private String tenCongTy;
    private String tenNguoiDaiDien;
    private String diaChi;
    private String email;
    private String soDienThoai;
}
