package com.example.ticket.service;

import com.example.ticket.dto.response.BaoCaoResponse;

import java.time.LocalDate;
import java.util.List;

public interface BaoCaoService {

    /**
     * Kết sổ cuối ngày cho một nhân viên.
     * Tự tính doanhThu, soVeDaBan, soVeTon từ CHITIETHOADON + VE.
     * Nếu đã có báo cáo ngày đó thì cập nhật, chưa có thì tạo mới.
     */
    BaoCaoResponse ketSoCuoiNgay(Long maNhanVien, LocalDate ngay);

    /**
     * Lấy toàn bộ lịch sử báo cáo của nhân viên.
     */
    List<BaoCaoResponse> getBaoCaoByNhanVien(Long maNhanVien);

    /**
     * Lấy báo cáo trong khoảng ngày.
     */
    List<BaoCaoResponse> getBaoCaoByRange(Long maNhanVien, LocalDate from, LocalDate to);
}