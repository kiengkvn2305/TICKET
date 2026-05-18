package com.example.ticket.repository;

import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.model.ChiTietHoaDonID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, ChiTietHoaDonID> {
    // Lấy tất cả chi tiết của 1 hóa đơn
    List<ChiTietHoaDon> findByIdMaHoaDon(Long maHoaDon);
    // Lấy tất cả chi tiết theo danh sách hóa đơn — dùng cho "Vé của tôi"
    List<ChiTietHoaDon> findByIdMaHoaDonIn(List<Long> maHoaDonList);
}