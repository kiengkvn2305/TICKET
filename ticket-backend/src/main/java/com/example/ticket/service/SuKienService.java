package com.example.ticket.service;

import com.example.ticket.model.SuKien;
import java.util.List;

public interface SuKienService{
    List<SuKien> getAll();
    SuKien getById(Long id);
    SuKien create(SuKien suKien);
    SuKien update(Long id, SuKien suKien);
    void delete(Long id);
    List<SuKien> getByCreator(Long maTaiKhoan);
}