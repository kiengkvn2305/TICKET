package com.example.ticket.service.impl;

import com.example.ticket.dto.request.VoucherRequest;
import com.example.ticket.dto.response.VoucherResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.exception.DuplicateResourceException;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.SuKien;
import com.example.ticket.model.Voucher;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VoucherRepository;
import com.example.ticket.service.VoucherService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final NhaToChucRepository nhaToChucRepository;
    private final SuKienRepository suKienRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository,
                              NhaToChucRepository nhaToChucRepository,
                              SuKienRepository suKienRepository) {
        this.voucherRepository = voucherRepository;
        this.nhaToChucRepository = nhaToChucRepository;
        this.suKienRepository = suKienRepository;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private NhaToChuc findNhaToChuc(Long maTaiKhoan) {
        return nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức"));
    }

    private SuKien findSuKien(Long maSuKien) {
        return suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sự kiện"));
    }

    private Voucher findVoucher(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khuyến mãi"));
    }

    private void validateMucKhuyenMai(Double mucKhuyenMai) {
        if (mucKhuyenMai == null || mucKhuyenMai < 0 || mucKhuyenMai > 100) {
            throw new BadRequestException("Mức khuyến mãi phải từ 0 đến 100");
        }
    }

    private void validateNgay(VoucherRequest request) {
        if (request.getNgayBatDau() == null || request.getNgayKetThuc() == null) {
            throw new BadRequestException("Vui lòng nhập ngày bắt đầu và kết thúc");
        }
        if (request.getNgayKetThuc().isBefore(request.getNgayBatDau())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");
        }
    }

    private VoucherResponse mapToResponse(Voucher v, SuKien suKien) {
        VoucherResponse r = new VoucherResponse();
        r.setMaVoucher(v.getMaVoucher());
        r.setMaCode(v.getMaCode());
        r.setDieuKien(v.getDieuKien());
        r.setMucKhuyenMai(v.getMucKhuyenMai());
        r.setTrangThai(v.getTrangThai());
        r.setLuotSuDung(v.getLuotSuDung());
        r.setMaCongTy(v.getMaCongTy());
        r.setMaSuKien(v.getMaSuKien());
        r.setNgayBatDau(v.getNgayBatDau());
        r.setNgayKetThuc(v.getNgayKetThuc());
        if (suKien != null) {
            r.setTenSuKien(suKien.getTenSuKien());
        }
        return r;
    }

    // ── queries ───────────────────────────────────────────────────────────────

    @Override
    public List<VoucherResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = findNhaToChuc(maTaiKhoan);
        List<Voucher> vouchers = voucherRepository.findByMaCongTy(ntc.getMaCongTy());
        if (vouchers.isEmpty()) return List.of();

        // FIX: N+1 — load tất cả SuKien cần thiết trong 1 query thay vì query per voucher
        List<Long> suKienIds = vouchers.stream()
                .map(Voucher::getMaSuKien)
                .filter(id -> id != null)
                .distinct().toList();
        Map<Long, SuKien> skMap = suKienRepository.findAllById(suKienIds)
                .stream().collect(java.util.stream.Collectors.toMap(SuKien::getMaSuKien, s -> s));

        return vouchers.stream()
                .map(v -> mapToResponse(v, skMap.get(v.getMaSuKien())))
                .toList();
    }

    @Override
    public VoucherResponse getById(Long id) {
        Voucher v = findVoucher(id);
        SuKien sk = v.getMaSuKien() != null
                ? suKienRepository.findById(v.getMaSuKien()).orElse(null)
                : null;
        return mapToResponse(v, sk);
    }

    // ── commands ──────────────────────────────────────────────────────────────

    @Override
    public VoucherResponse getByCode(String maCode) {
        Voucher v = voucherRepository.findByMaCode(maCode.trim())
                .orElseThrow(() -> new NotFoundException("Mã voucher không tồn tại"));
        SuKien sk = v.getMaSuKien() != null
                ? suKienRepository.findById(v.getMaSuKien()).orElse(null)
                : null;
        return mapToResponse(v, sk);
    }

    @Override
    @Transactional
    public VoucherResponse create(VoucherRequest request) {
        validateMucKhuyenMai(request.getMucKhuyenMai());
        validateNgay(request);

        NhaToChuc ntc = findNhaToChuc(request.getMaTaiKhoan());
        SuKien sk = findSuKien(request.getMaSuKien());

        boolean duplicate = voucherRepository
                .findByMaCongTy(ntc.getMaCongTy())
                .stream()
                .anyMatch(v -> v.getMaCode().equalsIgnoreCase(request.getMaCode()));
        if (duplicate) {
            throw new DuplicateResourceException("Mã voucher đã tồn tại trong công ty");
        }

        Voucher v = new Voucher();
        v.setMaCode(request.getMaCode());
        v.setDieuKien(request.getDieuKien());
        v.setMucKhuyenMai(request.getMucKhuyenMai());
        v.setTrangThai(request.getTrangThai());
        v.setLuotSuDung(request.getLuotSuDung() != null ? request.getLuotSuDung() : 0);
        v.setMaCongTy(ntc.getMaCongTy());
        v.setMaSuKien(sk.getMaSuKien());
        v.setNgayBatDau(request.getNgayBatDau());
        v.setNgayKetThuc(request.getNgayKetThuc());

        return mapToResponse(voucherRepository.save(v), sk);
    }

    @Override
    @Transactional
    public VoucherResponse update(Long id, VoucherRequest request) {
        validateMucKhuyenMai(request.getMucKhuyenMai());
        validateNgay(request);

        Voucher existing = findVoucher(id);
        SuKien sk = findSuKien(request.getMaSuKien());

        existing.setMaCode(request.getMaCode());
        existing.setDieuKien(request.getDieuKien());
        existing.setMucKhuyenMai(request.getMucKhuyenMai());
        existing.setTrangThai(request.getTrangThai());
        existing.setMaSuKien(sk.getMaSuKien());
        existing.setNgayBatDau(request.getNgayBatDau());
        existing.setNgayKetThuc(request.getNgayKetThuc());
        if (request.getLuotSuDung() != null) {
            existing.setLuotSuDung(request.getLuotSuDung());
        }

        return mapToResponse(voucherRepository.save(existing), sk);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        voucherRepository.delete(findVoucher(id));
    }
}