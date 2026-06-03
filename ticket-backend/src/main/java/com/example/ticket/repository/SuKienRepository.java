package com.example.ticket.repository;

import com.example.ticket.model.SuKien;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SuKienRepository extends JpaRepository<SuKien, Long> {

    List<SuKien> findByMaCongTy(Long maCongTy);
    
    @Modifying
    @Query(value = "DELETE FROM SUKIEN WHERE MACONGTY = :id", nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);
}