package com.example.ticket.repository;
import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.model.ChiTietHoaDonID;
import org.springframework.data.jpa.repository.JpaRepository;

// BUG FIX: ID của ChiTietHoaDon là composite (ChiTietHoaDonID), không phải Long
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, ChiTietHoaDonID> {
}