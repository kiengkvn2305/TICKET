package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "GHE")
public class Ghe {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ghe_seq")
    @SequenceGenerator(name = "ghe_seq", sequenceName = "GHE_SEQ", allocationSize = 1)
    private Long maGhe;

    private String khuVuc;

    public Long getMaGhe() {
        return maGhe;
    }

    public void setMaGhe(Long maGhe) {
        this.maGhe = maGhe;
    }

    public String getKhuVuc() {
        return khuVuc;
    }

    public void setKhuVuc(String khuVuc) {
        this.khuVuc = khuVuc;
    }
}
