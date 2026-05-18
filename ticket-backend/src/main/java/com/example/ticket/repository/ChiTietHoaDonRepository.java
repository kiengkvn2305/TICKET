package com.example.ticket.repository;

import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.model.ChiTietHoaDonID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, ChiTietHoaDonID> {
    List<ChiTietHoaDon> findByIdMaHoaDon(Long maHoaDon);
    List<ChiTietHoaDon> findByIdMaHoaDonIn(List<Long> maHoaDonList);
    // Thêm: dùng cho tính doanh thu theo vé
    List<ChiTietHoaDon> findByIdMaVeIn(List<Long> maVeList);
}