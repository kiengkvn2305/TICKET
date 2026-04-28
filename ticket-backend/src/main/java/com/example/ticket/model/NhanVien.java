package com.example.ticket.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "NHANVIEN")
public class NhanVien {
    @Id
    private Long maNhanVien;
    
    private String tenNhanVien;
    private String email;
    private String soDienThoai;
    private LocalDate ngayVaoLam;
    private long luong;
    
}
