package com.example.ticket.service;

import org.springframework.stereotype.Service;
import com.example.ticket.repository.ChiTietHoaDonRepository;
import com.example.ticket.model.*;
import java.util.List;

@Service
public class ChiTietHoaDonService {

    private final ChiTietHoaDonRepository repo;

    public ChiTietHoaDonService(ChiTietHoaDonRepository repo) {
        this.repo = repo;
    }

    public List<ChiTietHoaDon> getAll() {
        return repo.findAll();
    }

    public ChiTietHoaDon save(ChiTietHoaDon ct) {
        System.out.println("SAVE CALLED");
        return repo.save(ct);
    }
}