package com.example.ticket.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.ticket.model.Ve;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface VeRepository extends JpaRepository<Ve, Long> {

}