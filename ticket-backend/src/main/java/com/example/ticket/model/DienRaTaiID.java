package com.example.ticket.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

// Composite key: (maDiaDiem, maSuKien) — dùng 2 ID, không dùng chuỗi tên làm khóa
@Embeddable
public class DienRaTaiID implements Serializable {

    private Long maDiaDiem;
    private Long maSuKien;

    public DienRaTaiID() {}

    public DienRaTaiID(Long maDiaDiem, Long maSuKien) {
        this.maDiaDiem = maDiaDiem;
        this.maSuKien = maSuKien;
    }

    public Long getMaDiaDiem() {
        return maDiaDiem;
    }

    public void setMaDiaDiem(Long maDiaDiem) {
        this.maDiaDiem = maDiaDiem;
    }

    public Long getMaSuKien() {
        return maSuKien;
    }

    public void setMaSuKien(Long maSuKien) {
        this.maSuKien = maSuKien;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DienRaTaiID)) return false;
        DienRaTaiID that = (DienRaTaiID) o;
        return Objects.equals(maDiaDiem, that.maDiaDiem)
                && Objects.equals(maSuKien, that.maSuKien);
    }

    @Override
    public int hashCode() {
        return Objects.hash(maDiaDiem, maSuKien);
    }
}
