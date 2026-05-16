package com.example.ticket.repository;

import com.example.ticket.model.Ve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VeRepository extends JpaRepository<Ve, Long> {
    List<Ve> findByMaSuKien(Long maSuKien);
    List<Ve> findByTrangThai(String trangThai);
    List<Ve> findByMaSuKienIn(List<Long> maSuKienIds);
    boolean existsByTenVeAndMaSuKien(String tenVe, Long maSuKien);
}