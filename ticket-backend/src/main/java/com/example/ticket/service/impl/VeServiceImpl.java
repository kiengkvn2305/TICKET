package com.example.ticket.service.impl;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;

import com.example.ticket.model.SuKien;
import com.example.ticket.model.Ve;

import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;

import com.example.ticket.service.VeService;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class VeServiceImpl
    implements VeService {

    private final VeRepository veRepository;

    private final SuKienRepository suKienRepository;

    public VeServiceImpl(

        VeRepository veRepository,

        SuKienRepository suKienRepository

    ) {

        this.veRepository =
            veRepository;

        this.suKienRepository =
            suKienRepository;

    }

    /* =========================
       CREATE
    ========================= */

    @Override
    public VeResponse create(
        VeRequest request
    ) {

        // CHECK EVENT EXIST

        SuKien suKien =
            suKienRepository
            .findById(
                request.getMaSuKien()
            )

            .orElseThrow(() ->

                new RuntimeException(
                    "Sự kiện không tồn tại"
                )

            );

        // CHECK GIÁ

        if (
            request.getGia() < 0
        ) {

            throw new RuntimeException(
                "Giá vé không hợp lệ"
            );

        }

        Ve ve =
            new Ve();

        ve.setTenVe(
            request.getTenVe()
        );

        ve.setLoaiVe(
            request.getLoaiVe()
        );

        ve.setGia(
            request.getGia()
        );

        ve.setTrangThai(
            request.getTrangThai()
        );

        ve.setMoTa(
            request.getMoTa()
        );

        ve.setMaSuKien(
            suKien.getMaSuKien()
        );

        Ve saved =
            veRepository.save(ve);

        return mapToResponse(
            saved,
            suKien
        );

    }

    /* =========================
       GET ALL
    ========================= */

    @Override
    public List<VeResponse> getAll() {

        return veRepository
            .findAll()
            .stream()
            .map(ve -> {

                SuKien suKien =
                    suKienRepository
                    .findById(
                        ve.getMaSuKien()
                    )
                    .orElse(null);

                return mapToResponse(
                    ve,
                    suKien
                );

            })

            .toList();

    }

    /* =========================
       GET BY ID
    ========================= */

    @Override
    public VeResponse getById(
        Long id
    ) {

        Ve ve =
            veRepository
            .findById(id)

            .orElseThrow(() ->

                new RuntimeException(
                    "Không tìm thấy vé"
                )

            );

        SuKien suKien =
            suKienRepository
            .findById(
                ve.getMaSuKien()
            )
            .orElse(null);

        return mapToResponse(
            ve,
            suKien
        );

    }

    /* =========================
       UPDATE
    ========================= */

    @Override
    public VeResponse update(Long id, VeRequest request) {
        Ve existing = veRepository.findById(id).orElseThrow(() ->
            new RuntimeException(
                "Không tìm thấy vé"
            )

        );

        SuKien suKien =
            suKienRepository
            .findById(
                existing.getMaSuKien()
            )
            .orElse(null);

        if (
            request.getGia() < 0
        ) {

            throw new RuntimeException(
                "Giá vé không hợp lệ"
            );

        }

        existing.setTenVe(
            request.getTenVe()
        );

        existing.setLoaiVe(
            request.getLoaiVe()
        );

        existing.setGia(
            request.getGia()
        );

        existing.setTrangThai(
            request.getTrangThai()
        );

        existing.setMoTa(
            request.getMoTa()
        );

        Ve updated =
            veRepository.save(
                existing
            );

        return mapToResponse(updated, suKien);
    }

    /* =========================
       DELETE
    ========================= */

    @Override
    public void delete(
        Long id
    ) {

        Ve ve =
            veRepository
            .findById(id)

            .orElseThrow(() ->

                new RuntimeException(
                    "Không tìm thấy vé"
                )

            );

        veRepository.delete(ve);

    }

    /* =========================
       MAP RESPONSE
    ========================= */

    private VeResponse mapToResponse(

        Ve ve,

        SuKien suKien

    ) {

        VeResponse response =
            new VeResponse();

        response.setMaVe(
            ve.getMaVe()
        );

        response.setTenVe(
            ve.getTenVe()
        );

        response.setLoaiVe(
            ve.getLoaiVe()
        );

        response.setGia(
            ve.getGia()
        );

        response.setTrangThai(
            ve.getTrangThai()
        );

        response.setMoTa(
            ve.getMoTa()
        );

        response.setMaSuKien(
            ve.getMaSuKien()
        );

        if (suKien != null) {

            response.setTenSuKien(
                suKien.getTenSuKien()
            );

        }

        return response;

    }

}