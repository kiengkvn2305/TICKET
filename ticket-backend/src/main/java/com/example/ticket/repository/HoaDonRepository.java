package com.example.ticket.repository;

import com.example.ticket.model.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    List<HoaDon> findByMaKhachHang(Long maKhachHang);

    // Dùng cho tính doanh thu: lấy tất cả hóa đơn của nhiều khách hàng cùng lúc
    List<HoaDon> findByMaKhachHangIn(List<Long> maKhachHangIds);

    // Lấy tất cả hóa đơn đã dùng voucher — để trừ đúng doanh thu
    @Query("SELECT h FROM HoaDon h WHERE h.maVoucher IS NOT NULL AND h.maVoucher IN :maVoucherIds")
    List<HoaDon> findByMaVoucherIn(@Param("maVoucherIds") List<Long> maVoucherIds);
    List<HoaDon> findByMaNhanVien(Long maNhanVien);
}