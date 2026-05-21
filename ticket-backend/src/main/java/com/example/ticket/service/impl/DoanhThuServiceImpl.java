package com.example.ticket.service.impl;

import com.example.ticket.dto.response.DoanhThuResponse;
import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.service.DoanhThuService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DoanhThuServiceImpl implements DoanhThuService {

    private final NhaToChucRepository     nhaToChucRepository;
    private final SuKienRepository        suKienRepository;
    private final VeRepository            veRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final HoaDonRepository        hoaDonRepository;
    private final HoanVeRepository        hoanVeRepository;

    public DoanhThuServiceImpl(NhaToChucRepository nhaToChucRepository,
                               SuKienRepository suKienRepository,
                               VeRepository veRepository,
                               ChiTietHoaDonRepository chiTietHoaDonRepository,
                               HoaDonRepository hoaDonRepository,
                               HoanVeRepository hoanVeRepository) {
        this.nhaToChucRepository     = nhaToChucRepository;
        this.suKienRepository        = suKienRepository;
        this.veRepository            = veRepository;
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
        this.hoaDonRepository        = hoaDonRepository;
        this.hoanVeRepository        = hoanVeRepository;
    }

    @Override
    public List<DoanhThuResponse> getDoanhThuByCreator(Long maTaiKhoan) {

        // 1. Tìm nhà tổ chức
        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức"));

        // 2. Lấy tất cả sự kiện của công ty
        List<SuKien> suKiens = suKienRepository.findByMaCongTy(ntc.getMaCongTy());
        if (suKiens.isEmpty()) return List.of();

        // 3. Batch load vé
        List<Long> maSuKienIds = suKiens.stream().map(SuKien::getMaSuKien).toList();
        List<Ve>   allVes      = veRepository.findByMaSuKienIn(maSuKienIds);

        Map<Long, List<Ve>> vesBySuKien = allVes.stream()
                .collect(Collectors.groupingBy(Ve::getMaSuKien));

        // 4. Batch load ChiTietHoaDon
        List<Long> maVeIds     = allVes.stream().map(Ve::getMaVe).toList();
        List<ChiTietHoaDon> allChiTiet = maVeIds.isEmpty()
                ? List.of()
                : chiTietHoaDonRepository.findByIdMaVeIn(maVeIds);

        Map<Long, List<ChiTietHoaDon>> chiTietByVe = allChiTiet.stream()
                .collect(Collectors.groupingBy(ct -> ct.getId().getMaVe()));

        // 5. Batch load HoaDon
        List<Long> maHoaDonIds = allChiTiet.stream()
                .map(ct -> ct.getId().getMaHoaDon()).distinct().toList();
        Map<Long, HoaDon> hoaDonMap = maHoaDonIds.isEmpty()
                ? Map.of()
                : hoaDonRepository.findAllById(maHoaDonIds)
                        .stream().collect(Collectors.toMap(HoaDon::getMaHoaDon, h -> h));

        // 6. Batch load HoanVe đã APPROVED
        List<HoanVe> allHoanVe = maHoaDonIds.isEmpty()
                ? List.of()
                : hoanVeRepository.findByMaHoaDonIn(maHoaDonIds).stream()
                        .filter(hv -> "approved".equalsIgnoreCase(hv.getTrangThaiHoan()))
                        .toList();

        // Map: "maHoaDon_maVe" → tổng soLuongHoan đã duyệt
        Map<String, Integer> hoanMap = new HashMap<>();
        for (HoanVe hv : allHoanVe) {
            String key = hv.getMaHoaDon() + "_" + hv.getMaVe();
            hoanMap.merge(key, hv.getSoLuongHoan(), Integer::sum);
        }

        // 7. Assemble response
        return suKiens.stream().map(sk -> {
            List<Ve> ves = vesBySuKien.getOrDefault(sk.getMaSuKien(), List.of());

            List<DoanhThuResponse.LoaiVeStats> chiTietLoaiVe = ves.stream().map(ve -> {
                List<ChiTietHoaDon> ctList = chiTietByVe.getOrDefault(ve.getMaVe(), List.of());

                int tongBan  = ctList.stream().mapToInt(ChiTietHoaDon::getSoLuong).sum();
                int tongHoan = ctList.stream().mapToInt(ct -> {
                    String key = ct.getId().getMaHoaDon() + "_" + ve.getMaVe();
                    return hoanMap.getOrDefault(key, 0);
                }).sum();
                int daBan = Math.max(0, tongBan - tongHoan);

                // Build map: maHoaDon → danh sách ChiTietHoaDon cùng hóa đơn (dùng cho tính voucher)
                Map<Long, List<ChiTietHoaDon>> chiTietByHoaDon = ctList.stream()
                        .collect(Collectors.groupingBy(ct -> ct.getId().getMaHoaDon()));

                long doanhThuVe = ctList.stream().mapToLong(ct -> {
                    Long   hdId     = ct.getId().getMaHoaDon();
                    HoaDon hd       = hoaDonMap.get(hdId);
                    String key      = hdId + "_" + ve.getMaVe();
                    int    soHoan   = hoanMap.getOrDefault(key, 0);
                    int    soConLai = Math.max(0, ct.getSoLuong() - soHoan);

                    if (hd == null) return ct.getDonGia() * (long) soConLai;

                    if (hd.getMaVoucher() == null) {
                        return ct.getDonGia() * (long) soConLai;
                    }

                    if (ct.getSoLuong() == 0) return 0L;

                    // Lấy tất cả dòng cùng hóa đơn từ map đã build bên ngoài — không cần filter nested lambda
                    List<ChiTietHoaDon> tatCaDong = chiTietByHoaDon.getOrDefault(hdId, List.of());
                    long tongGoc = tatCaDong.stream()
                            .mapToLong(c -> c.getDonGia() * c.getSoLuong()).sum();
                    if (tongGoc == 0) return 0L;

                    double tiLe         = (double)(ct.getDonGia() * ct.getSoLuong()) / tongGoc;
                    long   doanhThuDong = Math.round(tiLe * hd.getThanhTien());
                    long   giaHoanMoiVe = Math.round((double) doanhThuDong / ct.getSoLuong());
                    long   tienHoan     = giaHoanMoiVe * soHoan;

                    return Math.max(0, doanhThuDong - tienHoan);
                }).sum();

                DoanhThuResponse.LoaiVeStats stats = new DoanhThuResponse.LoaiVeStats();
                stats.setMaVe(ve.getMaVe());
                stats.setTenVe(ve.getTenVe());
                stats.setLoaiVe(ve.getLoaiVe());
                stats.setGia(ve.getGia());
                stats.setDaBan(daBan);
                stats.setDoanhThu(doanhThuVe);
                return stats;
            }).toList();

            long tongDoanhThu = chiTietLoaiVe.stream().mapToLong(DoanhThuResponse.LoaiVeStats::getDoanhThu).sum();
            int  tongVeDaBan  = chiTietLoaiVe.stream().mapToInt(DoanhThuResponse.LoaiVeStats::getDaBan).sum();
            int  tongVeTongSo = ves.stream().mapToInt(ve -> {
                List<ChiTietHoaDon> ctList = chiTietByVe.getOrDefault(ve.getMaVe(), List.of());
                return ctList.stream().mapToInt(ChiTietHoaDon::getSoLuong).sum();
            }).sum();

            DoanhThuResponse res = new DoanhThuResponse();
            res.setMaSuKien(sk.getMaSuKien());
            res.setTenSuKien(sk.getTenSuKien());
            res.setThoiGianBatDau(sk.getThoiGianBatDau()  != null ? sk.getThoiGianBatDau().toString()  : null);
            res.setThoiGianKetThuc(sk.getThoiGianKetThuc() != null ? sk.getThoiGianKetThuc().toString() : null);
            res.setTongDoanhThu(tongDoanhThu);
            res.setTongVeDaBan(tongVeDaBan);
            res.setTongVeTongSo(tongVeTongSo);
            res.setChiTietLoaiVe(chiTietLoaiVe);
            return res;
        }).toList();
    }
}