package com.example.ticket.repository;

import com.example.ticket.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByMaCongTy(Long maCongTy);
    
}