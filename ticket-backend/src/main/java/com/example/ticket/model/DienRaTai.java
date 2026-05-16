package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "DIENRATAI")
public class DienRaTai {

    @EmbeddedId
    private DienRaTaiID id;

    private String trangThai;

    public DienRaTai() {}

    public DienRaTaiID getId() {
        return id;
    }

    public void setId(DienRaTaiID id) {
        this.id = id;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }
}
