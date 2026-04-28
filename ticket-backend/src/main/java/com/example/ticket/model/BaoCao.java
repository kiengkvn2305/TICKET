package com.example.ticket.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "BAOCAO")
public class BaoCao {
    @Id
    private long maBaoCao;
    
    private long doanhThu;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private int soVeDaBan;
    private int soVeTon;
}
