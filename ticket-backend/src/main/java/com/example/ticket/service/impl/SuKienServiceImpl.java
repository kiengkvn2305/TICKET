package com.example.ticket.service.impl;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;

import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.SuKien;

import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.SuKienRepository;

import com.example.ticket.service.SuKienService;

import com.example.ticket.exception.*;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;

@Service
public class SuKienServiceImpl implements SuKienService {

    private final SuKienRepository suKienRepository;

    private final NhaToChucRepository nhaToChucRepository;

    public SuKienServiceImpl(SuKienRepository suKienRepository, NhaToChucRepository nhaToChucRepository){
        this.suKienRepository = suKienRepository;
        this.nhaToChucRepository = nhaToChucRepository;
    }

    @Override
    public List<SuKienResponse> getAll() {

        return suKienRepository.findAll()
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Override
    public SuKienResponse getById(Long id) {

        SuKien suKien =
            suKienRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException(
                    "Không tìm thấy sự kiện"
                )
            );

        return mapToResponse(suKien);
    }

    @Override
    public SuKienResponse create(SuKienRequest request) {
        if (request.getThoiGianKetThuc().isBefore(request.getThoiGianBatDau())) {
            throw new RuntimeException(
                "Thời gian kết thúc phải sau thời gian bắt đầu"
            );
        }
        
        
        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(request.getMaTaiKhoan()).orElseThrow(() ->
            new RuntimeException(
                "Không tìm thấy nhà tổ chức"
            )
        );

        SuKien suKien = new SuKien();

        suKien.setTenSuKien(
            request.getTenSuKien()
        );

        suKien.setMoTa(
            request.getMoTa()
        );

        suKien.setThoiGianBatDau(
            request.getThoiGianBatDau()
        );

        suKien.setThoiGianKetThuc(
            request.getThoiGianKetThuc()
        );

        suKien.setMaCongTy(
            ntc.getMaCongTy()
        );

        try {
            SuKien saved = suKienRepository.save(suKien);
            return mapToResponse(saved);
        } catch (DataIntegrityViolationException e){
            throw new RuntimeException(
                "Sự kiện đã tồn tại"
            );
        }
    }

    @Override
    public SuKienResponse update(Long id, SuKienRequest request) {
        if (request.getThoiGianKetThuc().isBefore(request.getThoiGianBatDau())) {
            throw new RuntimeException(
                "Thời gian kết thúc phải sau thời gian bắt đầu"
            );
        }
        SuKien existing =
            suKienRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException(
                    "Không tìm thấy sự kiện"
                )
            );

        existing.setTenSuKien(
            request.getTenSuKien()
        );

        existing.setMoTa(
            request.getMoTa()
        );

        existing.setThoiGianBatDau(
            request.getThoiGianBatDau()
        );

        existing.setThoiGianKetThuc(
            request.getThoiGianKetThuc()
        );
        
        try {
            SuKien updated = suKienRepository.save(existing);
            return mapToResponse(updated);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException(
                "Sự kiện đã tồn tại"
            );
        }
    }

    @Override
    public void delete(Long id) {

        SuKien suKien =
            suKienRepository.findById(id)
            .orElseThrow(() ->
                new RuntimeException(
                    "Không tìm thấy sự kiện"
                )
            );

        suKienRepository.delete(suKien);
    }

    @Override
    public List<SuKienResponse> getByCreator(
        Long maTaiKhoan
    ) {

        NhaToChuc ntc =
            nhaToChucRepository
            .findByMaTaiKhoan(
                maTaiKhoan
            )
            .orElseThrow(() ->
                new RuntimeException(
                    "Không tìm thấy nhà tổ chức"
                )
            );

        return suKienRepository
            .findByMaCongTy(
                ntc.getMaCongTy()
            )
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    private SuKienResponse mapToResponse(
        SuKien suKien
    ) {

        SuKienResponse response =
            new SuKienResponse();

        response.setMaSuKien(
            suKien.getMaSuKien()
        );

        response.setTenSuKien(
            suKien.getTenSuKien()
        );

        response.setMoTa(
            suKien.getMoTa()
        );

        response.setThoiGianBatDau(
            suKien.getThoiGianBatDau()
        );

        response.setThoiGianKetThuc(
            suKien.getThoiGianKetThuc()
        );

        response.setMaCongTy(
            suKien.getMaCongTy()
        );

        return response;
    }
}