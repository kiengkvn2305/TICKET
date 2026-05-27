package com.example.ticket.service;

import com.example.ticket.dto.response.GheHoldResponse;

import java.util.Set;

public interface GheService {
    /** Giữ ghế theo soThuTu + maSuKien (không cần maGhe). */
    GheHoldResponse giuGhe(Long maSuKien, String soThuTu, Long maTaiKhoan);

    /** Hủy giữ ghế. */
    GheHoldResponse huyGiuGhe(Long maSuKien, String soThuTu, Long maTaiKhoan);

    /**
     * Trả danh sách soThuTu đang bị giữ trong sự kiện.
     * Frontend dùng để tô màu "đang giữ" trên sơ đồ ghế.
     */
    Set<String> getDanhSachDangGiu(Long maSuKien);
}