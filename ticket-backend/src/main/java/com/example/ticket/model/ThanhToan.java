package com.example.ticket.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "THANHTOAN")
public class ThanhToan {
    @Id
    private long maThanhToan;
    
    private String trangThai;
    private long soTien;
    private LocalDateTime thoiGian;
    private String phuongThuc;
}
