package com.example.ticket.repository;

import com.example.ticket.model.SuKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SuKienRepository extends JpaRepository<SuKien, Long> {
   List<SuKien> findByMaCongTy(Long maCongTy);
}