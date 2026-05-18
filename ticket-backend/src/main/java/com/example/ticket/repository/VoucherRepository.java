package com.example.ticket.repository;

import com.example.ticket.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByMaCongTy(Long maCongTy);
    Optional<Voucher> findByMaCode(String maCode); // dùng khi apply voucher
}