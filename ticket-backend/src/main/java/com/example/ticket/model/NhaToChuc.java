package com.example.ticket.model;
import jakarta.persistence.*;

@Entity
@Table(name = "NHATOCHUC")

public class NhaToChuc {

    @Id
    @GeneratedValue(
        strategy = GenerationType.SEQUENCE,
        generator = "ntc_seq"
    )
    @SequenceGenerator(
        name = "ntc_seq",
        sequenceName = "NHATOCHUC_SEQ",
        allocationSize = 1
    )
    private Long maCongTy;
    
    private String tenCongTy;
    private String tenNguoiDaiDien;
    private String diaChi;
    private String email;
    private String soDienThoai;
    private Long maTaiKhoan;

    public NhaToChuc() {

    }

    public Long getMaCongTy() {
        return maCongTy;
    }

    public void setMaCongTy(Long maCongTy) {
        this.maCongTy = maCongTy;
    }

    public Long getMaTaiKhoan() {
        return maTaiKhoan;
    }

    public void setMaTaiKhoan(Long maTaiKhoan) {
        this.maTaiKhoan = maTaiKhoan;
    }

}
