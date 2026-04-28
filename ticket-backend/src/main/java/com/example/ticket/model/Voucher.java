package com.example.ticket.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "VOUCHER")
public class Voucher {
    @Id
    private long maVoucher;
    
    private String dieuKien;
    private int mucKhuyenMai;
    private String maCode;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private String trangThai;
    private int luotSuDung;
}
