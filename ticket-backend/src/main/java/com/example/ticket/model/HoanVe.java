package com.example.ticket.model;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "HOANVE")
public class HoanVe {
    @Id
    private long maHoanVe;
    private LocalDate thoiGianHoan;
    private int soLuongHoan;
    private String lyDoHoan;
    private String trangThaiHoan;
}
