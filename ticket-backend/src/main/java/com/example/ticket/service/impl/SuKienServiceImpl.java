package com.example.ticket.service.impl;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.SuKien;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.service.SuKienService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SuKienServiceImpl implements SuKienService {

    private final SuKienRepository suKienRepository;
    private final NhaToChucRepository nhaToChucRepository;

    public SuKienServiceImpl(SuKienRepository suKienRepository,
                              NhaToChucRepository nhaToChucRepository) {
        this.suKienRepository = suKienRepository;
        this.nhaToChucRepository = nhaToChucRepository;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private NhaToChuc findNhaToChuc(Long maTaiKhoan) {
        return nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà tổ chức"));
    }

    private SuKien findSuKien(Long id) {
        return suKienRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sự kiện"));
    }

    private void validateThoiGian(SuKienRequest request) {
        if (request.getThoiGianKetThuc().isBefore(request.getThoiGianBatDau())) {
            throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
    }

    private SuKienResponse mapToResponse(SuKien s) {
        SuKienResponse r = new SuKienResponse();
        r.setMaSuKien(s.getMaSuKien());
        r.setTenSuKien(s.getTenSuKien());
        r.setMoTa(s.getMoTa());
        r.setThoiGianBatDau(s.getThoiGianBatDau());
        r.setThoiGianKetThuc(s.getThoiGianKetThuc());
        r.setMaCongTy(s.getMaCongTy());
        return r;
    }

    // ── queries ──────────────────────────────────────────────────────────────

    @Override
    public List<SuKienResponse> getAll() {
        return suKienRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public SuKienResponse getById(Long id) {
        return mapToResponse(findSuKien(id));
    }

    @Override
    public List<SuKienResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = findNhaToChuc(maTaiKhoan);

        Long maCongTy = ntc.getMaCongTy();
        if (maCongTy == null) return List.of();

        return suKienRepository.findByMaCongTy(maCongTy)
                .stream().map(this::mapToResponse).toList();
    }

    // ── commands ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SuKienResponse create(SuKienRequest request) {
        validateThoiGian(request);
        NhaToChuc ntc = findNhaToChuc(request.getMaTaiKhoan());

        SuKien suKien = new SuKien();
        suKien.setTenSuKien(request.getTenSuKien());
        suKien.setMoTa(request.getMoTa());
        suKien.setThoiGianBatDau(request.getThoiGianBatDau());
        suKien.setThoiGianKetThuc(request.getThoiGianKetThuc());
        suKien.setMaCongTy(ntc.getMaCongTy());

        try {
            return mapToResponse(suKienRepository.save(suKien));
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Sự kiện đã tồn tại");
        }
    }

    @Override
    @Transactional
    public SuKienResponse update(Long id, SuKienRequest request) {
        validateThoiGian(request);
        SuKien existing = findSuKien(id);

        existing.setTenSuKien(request.getTenSuKien());
        existing.setMoTa(request.getMoTa());
        existing.setThoiGianBatDau(request.getThoiGianBatDau());
        existing.setThoiGianKetThuc(request.getThoiGianKetThuc());

        try {
            return mapToResponse(suKienRepository.save(existing));
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Sự kiện đã tồn tại");
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        suKienRepository.delete(findSuKien(id));
    }
}