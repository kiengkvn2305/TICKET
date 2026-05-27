package com.example.ticket.dto.response;

import java.time.LocalDateTime;

public class GheHoldResponse {

    private String  soThuTu;
    private Long    maSuKien;
    private Long    maTaiKhoan;

    /** DANG_GIU | TRONG */
    private String  trangThai;

    /** Null nếu trangThai = TRONG */
    private LocalDateTime thoiGianHetHan;

    /** Giây còn lại. -1 nếu không đang giữ. */
    private long giayConLai;

    public GheHoldResponse() {}

    public GheHoldResponse(String soThuTu, Long maSuKien, Long maTaiKhoan,
                           String trangThai, LocalDateTime thoiGianHetHan) {
        this.soThuTu        = soThuTu;
        this.maSuKien       = maSuKien;
        this.maTaiKhoan     = maTaiKhoan;
        this.trangThai      = trangThai;
        this.thoiGianHetHan = thoiGianHetHan;
        this.giayConLai     = thoiGianHetHan != null
                ? java.time.Duration.between(LocalDateTime.now(), thoiGianHetHan).getSeconds()
                : -1;
    }

    public String  getSoThuTu()                    { return soThuTu; }
    public Long    getMaSuKien()                   { return maSuKien; }
    public Long    getMaTaiKhoan()                 { return maTaiKhoan; }
    public String  getTrangThai()                  { return trangThai; }
    public LocalDateTime getThoiGianHetHan()       { return thoiGianHetHan; }
    public long    getGiayConLai()                 { return giayConLai; }
}