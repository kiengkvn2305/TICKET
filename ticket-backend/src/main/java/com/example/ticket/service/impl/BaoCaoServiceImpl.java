package com.example.ticket.service.impl;

import com.example.ticket.dto.response.BaoCaoResponse;
import com.example.ticket.model.BaoCao;
import com.example.ticket.repository.*;
import com.example.ticket.service.BaoCaoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BaoCaoServiceImpl implements BaoCaoService {

    private final BaoCaoRepository          baoCaoRepository;
    private final HoaDonRepository          hoaDonRepository;
    private final ChiTietHoaDonRepository   chiTietHoaDonRepository;
    private final VeRepository              veRepository;
    private final NhanVienRepository        nhanVienRepository;

    public BaoCaoServiceImpl(BaoCaoRepository         baoCaoRepository,
                             HoaDonRepository          hoaDonRepository,
                             ChiTietHoaDonRepository   chiTietHoaDonRepository,
                             VeRepository              veRepository,
                             NhanVienRepository        nhanVienRepository) {
        this.baoCaoRepository        = baoCaoRepository;
        this.hoaDonRepository        = hoaDonRepository;
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
        this.veRepository            = veRepository;
        this.nhanVienRepository      = nhanVienRepository;
    }

    // ── KẾT SỔ CUỐI NGÀY ─────────────────────────────────────────────────────

    @Override
    @Transactional
    public BaoCaoResponse ketSoCuoiNgay(Long maNhanVien, LocalDate ngay) {

        // 1. Tổng doanh thu: SUM(thanhTien) FROM HOADON
        //    WHERE maNhanVien = ? AND ngayLap = ? AND trangThai <> 'DA_HUY'
        Long doanhThu = hoaDonRepository
                .sumDoanhThuByNhanVienAndNgay(maNhanVien, ngay);
        if (doanhThu == null) doanhThu = 0L;

        // 2. Tổng số vé ĐÃ BÁN trong ngày:
        //    SUM(ct.soLuong)
        //    FROM CHITIETHOADON ct JOIN HOADON hd ON ct.maHoaDon = hd.maHoaDon
        //    WHERE hd.maNhanVien = ? AND hd.ngayLap = ? AND hd.trangThai <> 'DA_HUY'
        //
        //    Lưu ý: ChiTietHoaDon dùng @EmbeddedId → trong JPQL truy cập qua id.maHoaDon
        Integer soVeDaBan = chiTietHoaDonRepository
                .sumSoLuongByNhanVienAndNgay(maNhanVien, ngay);
        if (soVeDaBan == null) soVeDaBan = 0;

        // 3. Vé tồn: SUM(soLuong - daBan) FROM VE WHERE soLuong > daBan
        Integer soVeTon = veRepository.sumVeTon();
        if (soVeTon == null) soVeTon = 0;

        // 4. Upsert báo cáo
        BaoCao bc = baoCaoRepository
                .findByMaNhanVienAndNgayBatDauAndNgayKetThuc(maNhanVien, ngay, ngay)
                .orElse(new BaoCao());

        bc.setMaNhanVien(maNhanVien);
        bc.setNgayBatDau(ngay);
        bc.setNgayKetThuc(ngay);
        bc.setDoanhThu(doanhThu);
        bc.setSoVeDaBan(soVeDaBan);
        bc.setSoVeTon(soVeTon);

        return toResponse(baoCaoRepository.save(bc));
    }

    // ── QUERIES ───────────────────────────────────────────────────────────────

    @Override
    public List<BaoCaoResponse> getBaoCaoByNhanVien(Long maNhanVien) {
        return baoCaoRepository
                .findByMaNhanVienOrderByNgayBatDauDesc(maNhanVien)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<BaoCaoResponse> getBaoCaoByRange(Long maNhanVien,
                                                  LocalDate from,
                                                  LocalDate to) {
        return baoCaoRepository
                .findByNhanVienAndRange(maNhanVien, from, to)
                .stream().map(this::toResponse).toList();
    }

    // ── MAPPER ────────────────────────────────────────────────────────────────

    private BaoCaoResponse toResponse(BaoCao bc) {
        BaoCaoResponse r = new BaoCaoResponse();
        r.setMaBaoCao(bc.getMaBaoCao());
        r.setMaNhanVien(bc.getMaNhanVien());
        r.setNgayBatDau(bc.getNgayBatDau());
        r.setNgayKetThuc(bc.getNgayKetThuc());
        r.setDoanhThu(bc.getDoanhThu());
        r.setSoVeDaBan(bc.getSoVeDaBan());
        r.setSoVeTon(bc.getSoVeTon());
        return r;
    }
}