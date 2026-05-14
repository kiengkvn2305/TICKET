package com.example.ticket.service.impl;

import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SuKienServiceImple implements SuKienService{

    @Autowired
    private SuKienRepository suKienRepository;

    @Autowired
    private NhaToChucRepository nhaToChucRepository;
    @Override
    public List<SuKien> getAll() {
        return suKienRepository.findAll();
    }
    @Override
    public SuKien getById(Long id) {
        return suKienRepository.findById(id).orElseThrow(() ->
            new RuntimeException(
                "Không tìm thấy sự kiện"
            ));
    }

    @Override
    public SuKien create(SuKien suKien) {
        return suKienRepository.save(suKien);
    }

    @Override
    public SuKien update(Long id, SuKien suKien){
        SuKien existing = getById(id);
        existing.setTenSuKien(suKien.getTenSuKien());
        existing.setMoTa(suKien.getMoTa());

        existing.setThoiGianBatDau(suKien.getThoiGianBatDau());
        existing.setThoiGianKetThuc(suKien.getThoiGianKetThuc());
        return suKienRepository.save(existing);
    }

    @Override
    public void delete(Long id){
        SuKien suKien = getById(id);
        suKienRepository.delete(suKien);
    }
    @Override
    public List<SuKien> getByCreator(Long maTaiKhoan) {
        // tìm nhà tổ chức theo tài khoản
        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan).orElseThrow(() ->
            new RuntimeException(
                "Không tìm thấy nhà tổ chức"
            ));

        // lấy event theo công ty
        return suKienRepository.findByMaCongTy(ntc.getMaCongTy());
    }
}