package com.example.ticket.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "HOADON")
public class HoaDon {
    @Id
    private long maHoaDon;
    private LocalDate ngayLap;
    private String trangThai;
    private long thanhTien;
}
