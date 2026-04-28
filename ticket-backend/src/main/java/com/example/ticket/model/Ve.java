
package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "VE")
public class Ve {
    @Id
    private long maVe;
    
    private String tenVe;
    private String loaiVe;
    private double gia;
    private String trangThai;
    private String moTa;
    private String maQR;
}
