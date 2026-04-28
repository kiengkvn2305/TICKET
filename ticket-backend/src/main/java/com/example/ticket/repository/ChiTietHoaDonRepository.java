package com.example.ticket.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.ticket.model.ChiTietHoaDon;


public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, Long> {
    
}
