package com.example.ticket.service.impl;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;
import com.example.ticket.exception.*;
import com.example.ticket.model.DiaDiem;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.SuKien;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.DiaDiemRepository;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;
import com.example.ticket.service.VeService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class VeServiceImpl implements VeService {

    private final VeRepository veRepository;
    private final SuKienRepository suKienRepository;
    private final NhaToChucRepository nhaToChucRepository;
    private final DiaDiemRepository diaDiemRepository;

    public VeServiceImpl(VeRepository veRepository,
                         SuKienRepository suKienRepository,
                         NhaToChucRepository nhaToChucRepository,
                         DiaDiemRepository diaDiemRepository) {
        this.veRepository        = veRepository;
        this.suKienRepository    = suKienRepository;
        this.nhaToChucRepository = nhaToChucRepository;
        this.diaDiemRepository   = diaDiemRepository;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private SuKien findSuKien(Long maSuKien) {
        return suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new EntityNotFoundException("Sự kiện không tồn tại"));
    }

    private Ve findVe(Long id) {
        return veRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy vé"));
    }

    private void validateGia(double gia) {
        if (gia < 0) throw new BadRequestException("Giá vé không được âm");
    }

    /**
     * Tính số lượng vé theo sức chứa địa điểm và loại sơ đồ.
     *
     * Hình vuông (HINH_VUONG): 3 vị trí VIP, 3 vị trí Thường
     *   VIP   = sucChua / 10 * 3   (chia 3 vị trí → seatsPerBlock = VIP / 3)
     *   Thường = sucChua / 10 * 7  (chia 3 vị trí → seatsPerBlock = Thuong / 3)
     *
     * Hình tròn (HINH_TRON): 4 vị trí VIP, 4 vị trí Thường
     *   VIP   = sucChua / 10 * 3   (chia 4 vị trí → seatsPerZone = VIP / 4)
     *   Thường = sucChua / 10 * 7  (chia 4 vị trí → seatsPerZone = Thuong / 4)
     */
    private int tinhSoLuong(SuKien suKien, String loaiVe) {
        if (suKien.getMaDiaDiem() == null) {
            // fallback cũ nếu sự kiện chưa gắn địa điểm
            boolean isVip = loaiVe != null && loaiVe.toUpperCase().contains("VIP");
            return isVip ? 30 : 70;
        }
        DiaDiem dd = diaDiemRepository.findById(suKien.getMaDiaDiem()).orElse(null);
        if (dd == null) {
            boolean isVip = loaiVe != null && loaiVe.toUpperCase().contains("VIP");
            return isVip ? 30 : 70;
        }

        int sucChua = dd.getSucChua();
        boolean isVip = loaiVe != null && loaiVe.toUpperCase().contains("VIP");
        String loaiSoDo = dd.getLoaiSoDo() == null ? "Hình vuông" : dd.getLoaiSoDo();
        boolean isCircle = "Hình tròn".equalsIgnoreCase(loaiSoDo);

        int soLuongVip    = isCircle ? sucChua / 10 * 4 : sucChua / 10 * 3;
        int soLuongThuong = isCircle ? sucChua / 10 * 6 : sucChua / 10 * 7;

        if (isCircle) {
            // 4 vị trí mỗi loại → tổng ghế = seatsPerZone * 4
            int seatsPerZone = isVip ? (soLuongVip / 4) : (soLuongThuong / 4);
            return seatsPerZone * 4;
        } else {
            // HINH_VUONG: 3 vị trí mỗi loại → tổng ghế = seatsPerBlock * 3
            int seatsPerBlock = isVip ? (soLuongVip / 3) : (soLuongThuong / 3);
            return seatsPerBlock * 3;
        }
    }

    private VeResponse mapToResponse(Ve ve, SuKien suKien) {
        VeResponse r = new VeResponse();
        r.setMaVe(ve.getMaVe());
        r.setTenVe(ve.getTenVe());
        r.setLoaiVe(ve.getLoaiVe());
        r.setGia(ve.getGia());
        r.setTrangThai(ve.getTrangThai());
        r.setMoTa(ve.getMoTa());
        r.setMaSuKien(ve.getMaSuKien());
        if (suKien != null) r.setTenSuKien(suKien.getTenSuKien());
        r.setSoLuong(ve.getSoLuong());
        r.setDaBan(ve.getDaBan());
        r.setConLai(ve.getConLai());  // tính động: soLuong - daBan
        return r;
    }

    // ── queries ───────────────────────────────────────────────────────────────

    @Override
    public List<VeResponse> getAll() {
        List<Ve> ves = veRepository.findAll();
        List<Long> ids = ves.stream().map(Ve::getMaSuKien).distinct().toList();
        Map<Long, SuKien> skMap = suKienRepository.findAllById(ids)
                .stream().collect(Collectors.toMap(SuKien::getMaSuKien, s -> s));
        return ves.stream()
                .map(ve -> mapToResponse(ve, skMap.get(ve.getMaSuKien())))
                .toList();
    }

    @Override
    public VeResponse getById(Long id) {
        Ve ve = findVe(id);
        SuKien sk = suKienRepository.findById(ve.getMaSuKien()).orElse(null);
        return mapToResponse(ve, sk);
    }

    @Override
    public List<VeResponse> getBySuKien(Long maSuKien) {
        SuKien sk = findSuKien(maSuKien);
        return veRepository.findByMaSuKien(maSuKien)
                .stream().map(ve -> mapToResponse(ve, sk)).toList();
    }

    @Override
    public List<VeResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà tổ chức"));

        // ✅ Guard: creator chưa có công ty
        Long maCongTy = ntc.getMaCongTy();
        if (maCongTy == null) return List.of();

        List<SuKien> suKiens = suKienRepository.findByMaCongTy(maCongTy);
        if (suKiens.isEmpty()) return List.of();

        Map<Long, SuKien> skMap = suKiens.stream()
                .collect(Collectors.toMap(SuKien::getMaSuKien, s -> s));

        List<Long> suKienIds = suKiens.stream().map(SuKien::getMaSuKien).toList();
        return veRepository.findByMaSuKienIn(suKienIds)
                .stream().map(ve -> mapToResponse(ve, skMap.get(ve.getMaSuKien()))).toList();
    }

    // ── commands ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VeResponse create(VeRequest request) {
        SuKien sk = findSuKien(request.getMaSuKien());
        validateGia(request.getGia());
        
        if (veRepository.existsByTenVeAndMaSuKien(request.getTenVe(), request.getMaSuKien())) {
            throw new DuplicateResourceException(
                "Vé '" + request.getTenVe() + "' đã tồn tại trong sự kiện này"
            );
        }
        if (veRepository.existsByLoaiVeAndMaSuKien(request.getLoaiVe(), request.getMaSuKien())) {
            throw new DuplicateResourceException(
                "Sự kiện này đã có vé loại '" + request.getLoaiVe() + "'. Mỗi sự kiện chỉ được tạo một vé VIP và một vé Thường."
            );
        }
        // Số lượng tính theo sức chứa địa điểm và loại sơ đồ
        int soLuongMacDinh = tinhSoLuong(sk, request.getLoaiVe());

        Ve ve = new Ve();
        ve.setTenVe(request.getTenVe());
        ve.setLoaiVe(request.getLoaiVe());
        ve.setGia(request.getGia());
        ve.setTrangThai(request.getTrangThai());
        ve.setMoTa(request.getMoTa());
        ve.setMaSuKien(sk.getMaSuKien());
        ve.setSoLuong(soLuongMacDinh);
        ve.setDaBan(0); // vé mới tạo chưa bán được vé nào

        try {
            return mapToResponse(veRepository.save(ve), sk);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException(
                "Vé '" + request.getTenVe() + "' đã tồn tại trong sự kiện này"
            );
        }
    }

    @Override
    @Transactional
    public VeResponse update(Long id, VeRequest request) {
        Ve existing = findVe(id);
        validateGia(request.getGia());

        // Không cho đổi sự kiện — giữ nguyên maSuKien cũ
        existing.setTenVe(request.getTenVe());
        existing.setLoaiVe(request.getLoaiVe());
        existing.setGia(request.getGia());
        existing.setTrangThai(request.getTrangThai());
        existing.setMoTa(request.getMoTa());
        // KHÔNG setDaBan, KHÔNG setSoLuong — số lượng cố định theo loại vé

        SuKien sk = suKienRepository.findById(existing.getMaSuKien()).orElse(null);
        return mapToResponse(veRepository.save(existing), sk);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        veRepository.delete(findVe(id));
    }

    @Override
    public boolean checkLoaiVeExists(Long maSuKien, String loaiVe) {
        return veRepository.existsByLoaiVeAndMaSuKien(loaiVe, maSuKien);
    }
}