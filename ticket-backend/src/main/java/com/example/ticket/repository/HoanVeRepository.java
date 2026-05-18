package com.example.ticket.repository;

import com.example.ticket.model.HoanVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoanVeRepository extends JpaRepository<HoanVe, Long> {

    List<HoanVe> findByMaHoaDonAndMaVe(Long maHoaDon, Long maVe);

    /** Dùng cho DoanhThuServiceImpl: batch load hoàn theo nhiều hóa đơn */
    List<HoanVe> findByMaHoaDonIn(List<Long> maHoaDonIds);

    /** Lấy tất cả yêu cầu hoàn vé thuộc sự kiện của nhà tổ chức (qua maCongTy) */
    @Query("""
        SELECT hv FROM HoanVe hv
        JOIN ChiTietHoaDon ct ON ct.id.maHoaDon = hv.maHoaDon AND ct.id.maVe = hv.maVe
        JOIN Ve v              ON v.maVe = hv.maVe
        JOIN SuKien sk         ON sk.maSuKien = v.maSuKien
        WHERE sk.maCongTy = :maCongTy
        ORDER BY hv.thoiGianHoan DESC
    """)
    List<HoanVe> findByMaCongTy(@Param("maCongTy") Long maCongTy);
}