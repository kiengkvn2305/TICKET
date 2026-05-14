package com.example.ticket.service.impl;

import com.example.ticket.model.*;

import com.example.ticket.repository.*;

import com.example.ticket.service.VoucherService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoucherServiceImpl implements VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private NhaToChucRepository nhaToChucRepository;

    @Override
    public List<Voucher> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan).orElseThrow(() ->
            new RuntimeException(
                "Không tìm thấy nhà tổ chức"
            ));

        return voucherRepository.findByMaCongTy(ntc.getMaCongTy());
    }
}