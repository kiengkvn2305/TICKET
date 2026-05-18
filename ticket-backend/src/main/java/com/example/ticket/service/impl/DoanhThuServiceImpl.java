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
    private final HoanVeRepository        hoanVeRepository;   // FIX: cần để trừ vé hoàn

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

        // 2. Lấy tất cả sự kiện của công ty (kể cả đã kết thúc — creator cần xem hết)
        List<SuKien> suKiens = suKienRepository.findByMaCongTy(ntc.getMaCongTy());
        if (suKiens.isEmpty()) return List.of();

        // 3. Batch load vé của tất cả sự kiện
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

        // ─── FIX: Batch load HoanVe đã APPROVED cho tất cả hóa đơn ─────────────
        // Chỉ tính hoàn đã được duyệt (trangThaiHoan = "approved") vào việc trừ.
        // Hoàn pending/rejected không ảnh hưởng đến số liệu đã bán.
        List<HoanVe> allHoanVe = maHoaDonIds.isEmpty()
                ? List.of()
                : hoanVeRepository.findByMaHoaDonIn(maHoaDonIds).stream()
                        .filter(hv -> "approved".equalsIgnoreCase(hv.getTrangThaiHoan()))
                        .toList();

        // Map: (maHoaDon, maVe) → tổng soLuongHoan đã được duyệt
        // Key dạng "maHoaDon_maVe" cho đơn giản
        Map<String, Integer> hoanMap = new HashMap<>();
        for (HoanVe hv : allHoanVe) {
            String key = hv.getMaHoaDon() + "_" + hv.getMaVe();
            hoanMap.merge(key, hv.getSoLuongHoan(), Integer::sum);
        }
        // ─────────────────────────────────────────────────────────────────────────

        // 6. Assemble response cho từng sự kiện
        return suKiens.stream().map(sk -> {
            List<Ve> ves = vesBySuKien.getOrDefault(sk.getMaSuKien(), List.of());

            List<DoanhThuResponse.LoaiVeStats> chiTietLoaiVe = ves.stream().map(ve -> {
                List<ChiTietHoaDon> ctList = chiTietByVe.getOrDefault(ve.getMaVe(), List.of());

                // ── FIX: tính daBan = tổng bán - tổng hoàn approved ──────────────
                int tongBan = ctList.stream().mapToInt(ChiTietHoaDon::getSoLuong).sum();
                int tongHoan = ctList.stream().mapToInt(ct -> {
                    String key = ct.getId().getMaHoaDon() + "_" + ve.getMaVe();
                    return hoanMap.getOrDefault(key, 0);
                }).sum();
                int daBan = Math.max(0, tongBan - tongHoan);
                // ─────────────────────────────────────────────────────────────────

                // Doanh thu phân bổ theo tỉ lệ (đã trừ phần hoàn)
                long doanhThuVe = ctList.stream().mapToLong(ct -> {
                    long hdId   = ct.getId().getMaHoaDon();
                    HoaDon hd   = hoaDonMap.get(hdId);
                    String key  = hdId + "_" + ve.getMaVe();
                    int soHoan  = hoanMap.getOrDefault(key, 0);

                    // Số lượng thực tế còn lại sau hoàn (theo từng dòng chi tiết)
                    int soConLai = Math.max(0, ct.getSoLuong() - soHoan);

                    if (hd == null) return (long)(ct.getDonGia() * soConLai);

                    if (hd.getMaVoucher() == null) {
                        // Không voucher → đơn giản: donGia * soConLai
                        return ct.getDonGia() * soConLai;
                    }

                    // Có voucher → phân bổ thanhTien theo tỉ lệ, rồi tính phần còn lại
                    if (ct.getSoLuong() == 0) return 0L;

                    List<ChiTietHoaDon> tatCaDong = allChiTiet.stream()
                            .filter(c -> c.getId().getMaHoaDon() == hdId)
                            .toList();
                    long tongGoc = tatCaDong.stream()
                            .mapToLong(c -> c.getDonGia() * c.getSoLuong()).sum();
                    if (tongGoc == 0) return 0L;

                    // Tỉ lệ đóng góp của dòng này
                    double tiLe = (double)(ct.getDonGia() * ct.getSoLuong()) / tongGoc;

                    // Phần doanh thu đã thanh toán cho dòng này
                    long doanhThuDong = Math.round(tiLe * hd.getThanhTien());

                    // Trừ phần hoàn: mỗi vé hoàn tương ứng donGia * (thanhTien/tongGoc) nếu có voucher
                    long giaHoanMoiVe = (ct.getSoLuong() > 0)
                            ? Math.round((double) doanhThuDong / ct.getSoLuong())
                            : 0;
                    long tienHoan = giaHoanMoiVe * soHoan;

                    return Math.max(0, doanhThuDong - tienHoan);
                }).sum();

                DoanhThuResponse.LoaiVeStats stats = new DoanhThuResponse.LoaiVeStats();
                stats.setMaVe(ve.getMaVe());
                stats.setTenVe(ve.getTenVe());
                stats.setLoaiVe(ve.getLoaiVe());
                stats.setGia(ve.getGia());
                stats.setDaBan(daBan);              // ← đã trừ vé hoàn
                stats.setDoanhThu(doanhThuVe);      // ← đã trừ doanh thu hoàn
                return stats;
            }).toList();

            long tongDoanhThu = chiTietLoaiVe.stream().mapToLong(DoanhThuResponse.LoaiVeStats::getDoanhThu).sum();
            int  tongVeDaBan  = chiTietLoaiVe.stream().mapToInt(DoanhThuResponse.LoaiVeStats::getDaBan).sum();
            int  tongVeTongSo = ves.stream().mapToInt(ve -> {
                // Tổng số vé phát hành theo soLuong của mỗi loại vé
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