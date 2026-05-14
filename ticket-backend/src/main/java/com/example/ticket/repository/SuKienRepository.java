package com.example.ticket.repository;

import com.example.ticket.model.SuKien;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuKienRepository extends JpaRepository<SuKien, Long> {

    List<SuKien> findByMaCongTy(Long maCongTy);
}