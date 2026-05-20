package com.example.ticket.repository;

import com.example.ticket.model.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, Long> {
}