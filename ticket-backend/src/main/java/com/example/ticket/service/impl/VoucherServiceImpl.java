package com.example.ticket.service.impl;

import com.example.ticket.dto.request.VoucherRequest;
import com.example.ticket.dto.response.VoucherResponse;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.Voucher;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.VoucherRepository;
import com.example.ticket.service.VoucherService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final NhaToChucRepository nhaToChucRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository,
                              NhaToChucRepository nhaToChucRepository) {
        this.voucherRepository = voucherRepository;
        this.nhaToChucRepository = nhaToChucRepository;
    }

    private NhaToChuc findNhaToChuc(Long maTaiKhoan) {
        return nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà tổ chức"));
    }

    private VoucherResponse mapToResponse(Voucher v) {
        VoucherResponse r = new VoucherResponse();
        r.setMaVoucher(v.getMaVoucher());
        r.setMaCode(v.getMaCode());
        r.setDieuKien(v.getDieuKien());
        r.setMucKhuyenMai(v.getMucKhuyenMai());
        r.setTrangThai(v.getTrangThai());
        r.setLuotSuDung(v.getLuotSuDung());
        r.setMaCongTy(v.getMaCongTy());
        return r;
    }

    @Override
    public List<VoucherResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = findNhaToChuc(maTaiKhoan);
        return voucherRepository.findByMaCongTy(ntc.getMaCongTy())
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public VoucherResponse getById(Long id) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        return mapToResponse(v);
    }

    @Override
    public VoucherResponse create(VoucherRequest request) {
        NhaToChuc ntc = findNhaToChuc(request.getMaTaiKhoan());

        if (request.getMucKhuyenMai() == null || request.getMucKhuyenMai() < 0 || request.getMucKhuyenMai() > 100) {
            throw new RuntimeException("Mức khuyến mãi phải từ 0 đến 100");
        }

        Voucher v = new Voucher();
        v.setMaCode(request.getMaCode());
        v.setDieuKien(request.getDieuKien());
        v.setMucKhuyenMai(request.getMucKhuyenMai());
        v.setTrangThai(request.getTrangThai());
        v.setLuotSuDung(request.getLuotSuDung() != null ? request.getLuotSuDung() : 0);
        v.setMaCongTy(ntc.getMaCongTy());

        return mapToResponse(voucherRepository.save(v));
    }

    @Override
    public VoucherResponse update(Long id, VoucherRequest request) {
        Voucher existing = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        if (request.getMucKhuyenMai() != null &&
            (request.getMucKhuyenMai() < 0 || request.getMucKhuyenMai() > 100)) {
            throw new RuntimeException("Mức khuyến mãi phải từ 0 đến 100");
        }

        existing.setMaCode(request.getMaCode());
        existing.setDieuKien(request.getDieuKien());
        existing.setMucKhuyenMai(request.getMucKhuyenMai());
        existing.setTrangThai(request.getTrangThai());
        if (request.getLuotSuDung() != null) {
            existing.setLuotSuDung(request.getLuotSuDung());
        }

        return mapToResponse(voucherRepository.save(existing));
    }

    @Override
    public void delete(Long id) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        voucherRepository.delete(v);
    }
}