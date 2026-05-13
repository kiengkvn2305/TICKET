package com.example.ticket.repository;

import com.example.ticket.model.SuKien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuKienRepository extends JpaRepository<SuKien, Long> {

}