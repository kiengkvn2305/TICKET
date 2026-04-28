package com.example.ticket.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "SUKIEN")
public class SuKien {
    @Id
    private long maSuKien;
    
    private String tenSuKien;
    private String moTa;
    private LocalDate thoiGianBatDau;
    private LocalDate thoiGianKetThuc;
}
