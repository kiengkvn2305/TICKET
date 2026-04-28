package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "GHE")
public class Ghe {
    @Id
    private long maGhe;
    
    private String khuVuc;
}
