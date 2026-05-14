package com.example.ticket.repository;

import com.example.ticket.model.NhaToChuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NhaToChucRepository extends JpaRepository<NhaToChuc, Long> {
    Optional<NhaToChuc>findByMaTaiKhoan(Long maTaiKhoan);
}