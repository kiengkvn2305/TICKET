package com.example.ticket.service.impl;

import com.example.ticket.dto.request.HoanVeRequest;
import com.example.ticket.dto.response.HoanVeDetailResponse;
import com.example.ticket.dto.response.HoanVeResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.service.HoanVeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class HoanVeServiceImpl implements HoanVeService {

    private final HoanVeRepository        hoanVeRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final HoaDonRepository        hoaDonRepository;
    private final NhaToChucRepository     nhaToChucRepository;
    private final VeRepository            veRepository;
    private final SuKienRepository        suKienRepository;
    private final KhachHangRepository     khachHangRepository;

    public HoanVeServiceImpl(HoanVeRepository hoanVeRepository,
                             ChiTietHoaDonRepository chiTietHoaDonRepository,
                             HoaDonRepository hoaDonRepository,
                             NhaToChucRepository nhaToChucRepository,
                             VeRepository veRepository,
                             SuKienRepository suKienRepository,
                             KhachHangRepository khachHangRepository) {
        this.hoanVeRepository        = hoanVeRepository;
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
        this.hoaDonRepository        = hoaDonRepository;
        this.nhaToChucRepository     = nhaToChucRepository;
        this.veRepository            = veRepository;
        this.suKienRepository        = suKienRepository;
        this.khachHangRepository     = khachHangRepository;
    }

    // ── Khách hàng gửi yêu cầu hoàn ─────────────────────────────────────────

    @Override
    public HoanVeResponse hoanVe(HoanVeRequest request) {
        hoaDonRepository.findById(request.getMaHoaDon())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hóa đơn #" + request.getMaHoaDon()));

        ChiTietHoaDonID id = new ChiTietHoaDonID(request.getMaVe(), request.getMaHoaDon());
        ChiTietHoaDon ct = chiTietHoaDonRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vé này không thuộc hóa đơn đã chọn"));

        if (request.getSoLuongHoan() <= 0)
            throw new BadRequestException("Số lượng hoàn phải lớn hơn 0");
        if (request.getSoLuongHoan() > ct.getSoLuong())
            throw new BadRequestException("Số lượng hoàn vượt quá số lượng đã mua (" + ct.getSoLuong() + ")");

        boolean dangHoan = hoanVeRepository
                .findByMaHoaDonAndMaVe(request.getMaHoaDon(), request.getMaVe())
                .stream().anyMatch(h -> "pending".equalsIgnoreCase(h.getTrangThaiHoan()));
        if (dangHoan)
            throw new BadRequestException("Vé này đã có yêu cầu hoàn đang chờ xử lý");

        HoanVe hoanVe = new HoanVe();
        hoanVe.setMaHoaDon(request.getMaHoaDon());
        hoanVe.setMaVe(request.getMaVe());
        hoanVe.setThoiGianHoan(LocalDate.now());
        hoanVe.setSoLuongHoan(request.getSoLuongHoan());
        hoanVe.setLyDoHoan(request.getLyDoHoan() != null ? request.getLyDoHoan().trim() : "Không có lý do");
        hoanVe.setTrangThaiHoan("pending");
        HoanVe saved = hoanVeRepository.save(hoanVe);

        HoanVeResponse res = new HoanVeResponse();
        res.setMaHoanVe(saved.getMaHoanVe());
        res.setMaHoaDon(saved.getMaHoaDon());
        res.setMaVe(saved.getMaVe());
        res.setThoiGianHoan(saved.getThoiGianHoan());
        res.setSoLuongHoan(saved.getSoLuongHoan());
        res.setLyDoHoan(saved.getLyDoHoan());
        res.setTrangThaiHoan(saved.getTrangThaiHoan());
        return res;
    }

    // ── Nhà tổ chức xem danh sách ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<HoanVeDetailResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức"));

        List<HoanVe> list = hoanVeRepository.findByMaCongTy(ntc.getMaCongTy());
        if (list.isEmpty()) return List.of();

        // Batch load Ve, SuKien, HoaDon, KhachHang
        List<Long> maVeIds  = list.stream().map(HoanVe::getMaVe).distinct().toList();
        List<Long> maHdIds  = list.stream().map(HoanVe::getMaHoaDon).distinct().toList();

        Map<Long, Ve>      veMap  = veRepository.findAllById(maVeIds)
                .stream().collect(Collectors.toMap(Ve::getMaVe, v -> v));
        Map<Long, SuKien>  skMap  = suKienRepository
                .findAllById(veMap.values().stream().map(Ve::getMaSuKien).distinct().toList())
                .stream().collect(Collectors.toMap(SuKien::getMaSuKien, s -> s));
        Map<Long, HoaDon>  hdMap  = hoaDonRepository.findAllById(maHdIds)
                .stream().collect(Collectors.toMap(HoaDon::getMaHoaDon, h -> h));
        Map<Long, KhachHang> khMap = khachHangRepository
                .findAllById(hdMap.values().stream().map(HoaDon::getMaKhachHang).distinct().toList())
                .stream().collect(Collectors.toMap(KhachHang::getMaKhachHang, k -> k));

        return list.stream().map(hv -> {
            Ve ve         = veMap.get(hv.getMaVe());
            SuKien sk     = ve != null ? skMap.get(ve.getMaSuKien()) : null;
            HoaDon hd     = hdMap.get(hv.getMaHoaDon());
            KhachHang kh  = hd != null ? khMap.get(hd.getMaKhachHang()) : null;

            HoanVeDetailResponse r = new HoanVeDetailResponse();
            r.setMaHoanVe(hv.getMaHoanVe());
            r.setMaHoaDon(hv.getMaHoaDon());
            r.setMaVe(hv.getMaVe());
            r.setTenVe(ve  != null ? ve.getTenVe()        : "—");
            r.setTenSuKien(sk != null ? sk.getTenSuKien() : "—");
            r.setTenKhachHang(kh != null ? kh.getTenKhachHang() : "—");
            r.setThoiGianHoan(hv.getThoiGianHoan());
            r.setSoLuongHoan(hv.getSoLuongHoan());
            r.setLyDoHoan(hv.getLyDoHoan());
            r.setTrangThaiHoan(hv.getTrangThaiHoan());
            return r;
        }).toList();
    }

    // ── Nhà tổ chức duyệt / từ chối ─────────────────────────────────────────

    @Override
    public HoanVeDetailResponse duyetHoanVe(Long maHoanVe, String trangThai) {
        if (!"approved".equalsIgnoreCase(trangThai) && !"rejected".equalsIgnoreCase(trangThai))
            throw new BadRequestException("Trạng thái phải là 'approved' hoặc 'rejected'");

        HoanVe hv = hoanVeRepository.findById(maHoanVe)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu hoàn vé #" + maHoanVe));

        if (!"pending".equalsIgnoreCase(hv.getTrangThaiHoan()))
            throw new BadRequestException("Yêu cầu này đã được xử lý rồi");

        hv.setTrangThaiHoan(trangThai.toLowerCase());
        hoanVeRepository.save(hv);

        // Nếu duyệt approved → giảm daBan của vé lại
        if ("approved".equalsIgnoreCase(trangThai)) {
            veRepository.findByIdWithLock(hv.getMaVe()).ifPresent(ve -> {
                int newDaBan = Math.max(0, ve.getDaBan() - hv.getSoLuongHoan());
                ve.setDaBan(newDaBan);
                veRepository.save(ve);
            });
        }

        // Reuse getByCreator logic — đơn giản build response trực tiếp
        Ve ve        = veRepository.findById(hv.getMaVe()).orElse(null);
        SuKien sk    = ve != null && ve.getMaSuKien() != null ? suKienRepository.findById(ve.getMaSuKien()).orElse(null) : null;
        HoaDon hd    = hoaDonRepository.findById(hv.getMaHoaDon()).orElse(null);
        KhachHang kh = hd != null ? khachHangRepository.findById(hd.getMaKhachHang()).orElse(null) : null;

        HoanVeDetailResponse r = new HoanVeDetailResponse();
        r.setMaHoanVe(hv.getMaHoanVe());
        r.setMaHoaDon(hv.getMaHoaDon());
        r.setMaVe(hv.getMaVe());
        r.setTenVe(ve  != null ? ve.getTenVe()        : "—");
        r.setTenSuKien(sk != null ? sk.getTenSuKien() : "—");
        r.setTenKhachHang(kh != null ? kh.getTenKhachHang() : "—");
        r.setThoiGianHoan(hv.getThoiGianHoan());
        r.setSoLuongHoan(hv.getSoLuongHoan());
        r.setLyDoHoan(hv.getLyDoHoan());
        r.setTrangThaiHoan(hv.getTrangThaiHoan());
        return r;
    }
}