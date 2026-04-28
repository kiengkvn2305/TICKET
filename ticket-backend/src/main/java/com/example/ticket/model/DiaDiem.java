package com.example.ticket.model;
import jakarta.persistence.*;


@Entity
@Table(name = "DIADIEM")
public class DiaDiem {
    @Id
    private long maDiaDiem;
    
    private String tenDiaDiem;
    private String diaChi;
    private int SucChua;
}
