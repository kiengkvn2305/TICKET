package com.example.ticket.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ticket.dto.request.MuaVeRequest;
import com.example.ticket.dto.response.ChiTietHoaDonResponse;
import com.example.ticket.dto.response.MuaVeResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.model.ChiTietHoaDonID;
import com.example.ticket.model.Ghe;
import com.example.ticket.model.HoaDon;
import com.example.ticket.model.KhachHang;
import com.example.ticket.model.SuKien;
import com.example.ticket.model.Ve;
import com.example.ticket.model.Voucher;
import com.example.ticket.repository.ChiTietHoaDonRepository;
import com.example.ticket.repository.GheRepository;
import com.example.ticket.repository.HoaDonRepository;
import com.example.ticket.repository.HoanVeRepository;
import com.example.ticket.repository.KhachHangRepository;
import com.example.ticket.repository.NhanVienRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;
import com.example.ticket.repository.VoucherRepository;
import com.example.ticket.service.HoaDonService;

@Service
@Transactional(readOnly = true)
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository        hoaDonRepository;
    private final ChiTietHoaDonRepository  chiTietHoaDonRepository;
    private final KhachHangRepository      khachHangRepository;
    private final VeRepository             veRepository;
    private final SuKienRepository         suKienRepository;
    private final VoucherRepository        voucherRepository;
    private final HoanVeRepository         hoanVeRepository;
    private final NhanVienRepository       nhanVienRepository;
    private final GheRepository            gheRepository;

    public HoaDonServiceImpl(HoaDonRepository hoaDonRepository,
                             ChiTietHoaDonRepository chiTietHoaDonRepository,
                             KhachHangRepository khachHangRepository,
                             VeRepository veRepository,
                             SuKienRepository suKienRepository,
                             VoucherRepository voucherRepository,
                             HoanVeRepository hoanVeRepository,
                             NhanVienRepository nhanVienRepository,
                             GheRepository gheRepository) {
        this.hoaDonRepository        = hoaDonRepository;
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
        this.khachHangRepository     = khachHangRepository;
        this.veRepository            = veRepository;
        this.suKienRepository        = suKienRepository;
        this.voucherRepository       = voucherRepository;
        this.hoanVeRepository        = hoanVeRepository;
        this.nhanVienRepository      = nhanVienRepository;
        this.gheRepository           = gheRepository;
    }

    // =========================================================================
    // muaVe
    // =========================================================================

    @Override
    @Transactional
    public MuaVeResponse muaVe(MuaVeRequest request) {
        return thucHienMuaVe(request);
    }

    @Override
    @Transactional
    public MuaVeResponse muaVeNhanVien(MuaVeRequest request) {
        if (request.getMaNhanVien() == null)
            throw new BadRequestException("maNhanVien là bắt buộc khi nhân viên bán vé tại quầy");
        MuaVeResponse res = thucHienMuaVe(request);
        // Nhân viên bán tại quầy → xác nhận thanh toán ngay, không cần pending
        hoaDonRepository.findById(res.getMaHoaDon()).ifPresent(hd -> {
            hd.setTrangThai("THANH_CONG");
            hoaDonRepository.save(hd);
        });
        res.setTrangThai("THANH_CONG");
        return res;
    }

    // =========================================================================
    // CORE
    // =========================================================================

    private MuaVeResponse thucHienMuaVe(MuaVeRequest request) {

        if (request.getItems() == null || request.getItems().isEmpty())
            throw new BadRequestException("Vui lòng chọn ít nhất 1 loại vé");
        for (MuaVeRequest.ItemRequest item : request.getItems()) {
            if (item.getSoLuong() <= 0)
                throw new BadRequestException("Số lượng vé phải lớn hơn 0");
        }

        int tongSoLuong = request.getItems().stream()
                .mapToInt(MuaVeRequest.ItemRequest::getSoLuong).sum();

        if (request.getGhes() == null || request.getGhes().isEmpty())
            throw new BadRequestException("Vui lòng chọn ghế ngồi");
        if (request.getGhes().size() != tongSoLuong)
            throw new BadRequestException(
                "Số ghế đã chọn (" + request.getGhes().size()
                + ") phải bằng tổng số vé (" + tongSoLuong + ")");

        long distinctGhe = request.getGhes().stream()
                .map(MuaVeRequest.GheRequest::getKhuVuc).distinct().count();
        if (distinctGhe != request.getGhes().size())
            throw new BadRequestException("Danh sách ghế có khu vực bị trùng");

        List<Long> maVeListGhe = request.getItems().stream()
                .map(MuaVeRequest.ItemRequest::getMaVe).toList();
        List<String> khuVucList = request.getGhes().stream()
                .map(MuaVeRequest.GheRequest::getKhuVuc).toList();
        List<Ghe> gheConflict = gheRepository.findConflict(khuVucList, maVeListGhe);
        if (!gheConflict.isEmpty()) {
            String conflictStr = gheConflict.stream()
                    .map(Ghe::getKhuVuc).collect(Collectors.joining(", "));
            throw new BadRequestException("Ghế đã được đặt: " + conflictStr);
        }

        KhachHang kh;
        if (request.getMaTaiKhoan() != null) {
            kh = khachHangRepository.findFirstByMaTaiKhoan(request.getMaTaiKhoan())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy khách hàng"));
        } else {
            kh = khachHangRepository.save(new KhachHang());
        }

        if (request.getMaNhanVien() != null
                && !nhanVienRepository.existsById(request.getMaNhanVien()))
            throw new NotFoundException("Không tìm thấy nhân viên ID: " + request.getMaNhanVien());

        List<Long> maVeList = request.getItems().stream()
                .map(MuaVeRequest.ItemRequest::getMaVe).toList();
        Map<Long, Ve> veMap = veRepository.findAllByIdWithLock(maVeList)
                .stream().collect(Collectors.toMap(Ve::getMaVe, v -> v));

        long thanhTienGoc = 0;
        for (MuaVeRequest.ItemRequest item : request.getItems()) {
            Ve ve = veMap.get(item.getMaVe());
            if (ve == null)
                throw new NotFoundException("Không tìm thấy vé ID: " + item.getMaVe());
            int conLai = ve.getSoLuong() - ve.getDaBan();
            if (item.getSoLuong() > conLai)
                throw new BadRequestException("Vé '" + ve.getTenVe() + "' chỉ còn " + conLai + " vé");
            thanhTienGoc += (long)(ve.getGia() * item.getSoLuong());
        }

        Double phanTramGiam  = null;
        Long   maVoucherSave = null;
        long   thanhTienSau  = thanhTienGoc;

        if (request.getMaVoucher() != null && !request.getMaVoucher().isBlank()) {
            Voucher voucher = voucherRepository.findByCodeWithLock(request.getMaVoucher().trim())
                    .orElseThrow(() -> new BadRequestException("Mã voucher không tồn tại"));
            if (!"active".equalsIgnoreCase(voucher.getTrangThai()))
                throw new BadRequestException("Voucher đã hết hạn hoặc không còn hiệu lực");

            if (request.getMaSuKien() != null
                    && voucher.getDanhSachSuKien() != null
                    && !voucher.getDanhSachSuKien().isBlank()) {
                boolean thuocSuKien = Arrays.stream(voucher.getDanhSachSuKien().split(","))
                        .map(String::trim).map(Long::parseLong)
                        .anyMatch(id -> id.equals(request.getMaSuKien()));
                if (!thuocSuKien)
                    throw new BadRequestException("Voucher này không áp dụng cho sự kiện đang chọn");
            }

            if (voucher.getMucKhuyenMai() != null && voucher.getMucKhuyenMai() > 0) {
                phanTramGiam  = voucher.getMucKhuyenMai();
                thanhTienSau  = Math.round(thanhTienGoc * (1 - phanTramGiam / 100.0));
                maVoucherSave = voucher.getMaVoucher();
                voucher.setLuotSuDung(
                    (voucher.getLuotSuDung() == null ? 0 : voucher.getLuotSuDung()) + 1);
                voucherRepository.save(voucher);
            }
        }

        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaKhachHang(kh.getMaKhachHang());
        hoaDon.setNgayLap(LocalDate.now());
        hoaDon.setTrangThai("pending");
        hoaDon.setThanhTien(thanhTienSau);
        hoaDon.setMaVoucher(maVoucherSave);
        hoaDon.setMaNhanVien(request.getMaNhanVien());
        HoaDon saved = hoaDonRepository.save(hoaDon);

        List<ChiTietHoaDonResponse> chiTietList = new ArrayList<>();
        for (MuaVeRequest.ItemRequest item : request.getItems()) {
            Ve ve = veMap.get(item.getMaVe());
            ve.setDaBan(ve.getDaBan() + item.getSoLuong());
            veRepository.save(ve);

            ChiTietHoaDonID ctId = new ChiTietHoaDonID(item.getMaVe(), saved.getMaHoaDon());
            ChiTietHoaDon ct = new ChiTietHoaDon();
            ct.setId(ctId);
            long donGia = (long) ve.getGia();
            ct.setDonGia(donGia);
            ct.setSoLuong(item.getSoLuong());
            chiTietHoaDonRepository.save(ct);

            ChiTietHoaDonResponse r = new ChiTietHoaDonResponse();
            r.setMaVe(item.getMaVe());
            r.setMaHoaDon(saved.getMaHoaDon());
            r.setDonGia(donGia);
            r.setSoLuong(item.getSoLuong());
            chiTietList.add(r);
        }

        // ✅ Mới — tái sử dụng ghế da_hoan nếu có
        for (MuaVeRequest.GheRequest gr : request.getGhes()) {
            Ghe ghe = gheRepository
                .findByKhuVucAndMaVeAndTrangThai(gr.getKhuVuc(), gr.getMaVe(), "da_hoan")
                .orElse(new Ghe());

            ghe.setKhuVuc(gr.getKhuVuc());
            ghe.setMaVe(gr.getMaVe());
            ghe.setMaHoaDon(saved.getMaHoaDon());
            ghe.setTrangThai("da_dat");
            gheRepository.save(ghe);
        }

        MuaVeResponse response = new MuaVeResponse();
        response.setMaHoaDon(saved.getMaHoaDon());
        response.setNgayLap(saved.getNgayLap());
        response.setThanhTienGoc(thanhTienGoc);
        response.setThanhTienSau(thanhTienSau);
        response.setPhanTramGiam(phanTramGiam);
        response.setTrangThai(saved.getTrangThai());
        response.setChiTiet(chiTietList);
        return response;
    }

    // =========================================================================
    // QUERIES
    // =========================================================================

    @Override
    public List<VeKhachHangResponse> getVeByKhachHang(Long maTaiKhoan) {
        KhachHang kh = khachHangRepository.findFirstByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khách hàng"));
        return buildResponseList(hoaDonRepository.findByMaKhachHang(kh.getMaKhachHang()));
    }

    @Override
    public List<VeKhachHangResponse> getAllVe() {
        return buildResponseList(hoaDonRepository.findAll());
    }

    @Override
    public List<VeKhachHangResponse> getVeByNhanVien(Long maNhanVien) {
        return buildResponseList(hoaDonRepository.findByMaNhanVien(maNhanVien));
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private List<VeKhachHangResponse> buildResponseList(List<HoaDon> hoaDons) {
        if (hoaDons.isEmpty()) return List.of();

        List<Long> maHoaDonList = hoaDons.stream().map(HoaDon::getMaHoaDon).toList();
        Map<Long, HoaDon> hoaDonMap = hoaDons.stream()
                .collect(Collectors.toMap(HoaDon::getMaHoaDon, h -> h));

        List<ChiTietHoaDon> chiTiets = chiTietHoaDonRepository.findByIdMaHoaDonIn(maHoaDonList);
        // KHÔNG return sớm khi chiTiets rỗng — vẫn trả về hóa đơn, chỉ thiếu chi tiết vé

        List<Long> maVeList = chiTiets.stream()
                .map(ct -> ct.getId().getMaVe()).distinct().toList();
        Map<Long, Ve> veMap = veRepository.findAllByIdWithLock(maVeList)
                .stream().collect(Collectors.toMap(Ve::getMaVe, v -> v));

        Map<Long, SuKien> skMap = suKienRepository
                .findAllById(veMap.values().stream()
                        .map(Ve::getMaSuKien).filter(Objects::nonNull).distinct().toList())
                .stream().collect(Collectors.toMap(SuKien::getMaSuKien, s -> s));

        // Ghế đã đặt: "maHoaDon_maVe" → list khuVuc
        List<Ghe> gheList = gheRepository.findByMaHoaDonIn(maHoaDonList);
        // Thay dòng 266-269 (gheMap chỉ có khuVuc) bằng:
        Map<String, List<Ghe>> gheMapFull = gheList.stream()
                .collect(Collectors.groupingBy(
                        g -> g.getMaHoaDon() + "_" + g.getMaVe()));

        // maGhe → maVe (dùng để resolve HoanVe)
        Map<Long, Long> gheToVeMap = gheList.stream()
                .filter(g -> g.getMaGhe() != null && g.getMaVe() != null)
                .collect(Collectors.toMap(Ghe::getMaGhe, Ghe::getMaVe, (a, b) -> a));

        Map<Long, Long> thanhTienGocMap = chiTiets.stream()
                .collect(Collectors.groupingBy(
                        ct -> ct.getId().getMaHoaDon(),
                        Collectors.summingLong(ct -> ct.getDonGia() * ct.getSoLuong())));

        // HoanVe: mỗi row = 1 ghế → đếm số ghế approved/pending per "maHoaDon_maVe"
        // Lấy trạng thái ưu tiên per vé: pending > approved > rejected
        Map<String, String> hoanVeStatusMap = new HashMap<>();  // "maHoaDon_maVe" → trangThai
        Map<String, Integer> hoanVeCountMap = new HashMap<>();  // "maHoaDon_maVe" → số ghế đã hoàn (approved)

        hoanVeRepository.findByMaHoaDonIn(maHoaDonList).forEach(hv -> {
            Long maVe = gheToVeMap.get(hv.getMaGhe());
            if (maVe == null) return;

            String key = hv.getMaHoaDon() + "_" + maVe;

            // Đếm số ghế approved để tính soLuongHoan hiển thị
            if ("approved".equalsIgnoreCase(hv.getTrangThaiHoan()))
                hoanVeCountMap.merge(key, 1, Integer::sum);

            // Ưu tiên trạng thái: pending > approved > rejected
            String existing = hoanVeStatusMap.get(key);
            if (existing == null || rankTrangThai(hv.getTrangThaiHoan()) > rankTrangThai(existing))
                hoanVeStatusMap.put(key, hv.getTrangThaiHoan());
        });

        return chiTiets.stream().map(ct -> {
            Ve     ve = veMap.get(ct.getId().getMaVe());
            HoaDon hd = hoaDonMap.get(ct.getId().getMaHoaDon());
            SuKien sk = ve != null && ve.getMaSuKien() != null ? skMap.get(ve.getMaSuKien()) : null;

            String hoanKey = (hd != null ? hd.getMaHoaDon() : 0)
                           + "_" + (ve != null ? ve.getMaVe() : 0);

            VeKhachHangResponse r = new VeKhachHangResponse();
            if (ve != null) {
                r.setMaVe(ve.getMaVe());
                r.setTenVe(ve.getTenVe());
                r.setLoaiVe(ve.getLoaiVe());
                r.setGia(ct.getDonGia());
                r.setTrangThai(ve.getTrangThai());
                r.setMaSuKien(ve.getMaSuKien());
                String gheKey = (hd != null ? hd.getMaHoaDon() : 0) + "_" + ve.getMaVe();
                List<Ghe> ghesOfVe = gheMapFull.getOrDefault(gheKey, List.of());
                // Giữ gheDat để tương thích cũ
                r.setGheDat(ghesOfVe.stream().map(Ghe::getKhuVuc).toList());

                // Thêm gheList kèm trangThai cho frontend xuất vé
                r.setGheList(ghesOfVe.stream().map(g -> {
                    VeKhachHangResponse.GheInfo info = new VeKhachHangResponse.GheInfo();
                    info.setMaGhe(g.getMaGhe());
                    info.setKhuVuc(g.getKhuVuc());
                    info.setTrangThai(g.getTrangThai());
                    return info;
                }).toList());
            }
            if (sk != null) {
                r.setTenSuKien(sk.getTenSuKien());
                r.setThoiGianBatDau(sk.getThoiGianBatDau());
                r.setThoiGianKetThuc(sk.getThoiGianKetThuc());
            }
            if (hd != null) {
                r.setMaHoaDon(hd.getMaHoaDon());
                r.setNgayMua(hd.getNgayLap());

                // Tính thanhTienGoc và thanhTien riêng cho từng loại vé theo tỉ lệ
                // thanhTienGocVe = donGia × soLuong (đóng góp của loại vé này)
                long thanhTienGocHoaDon = thanhTienGocMap.getOrDefault(
                        hd.getMaHoaDon(), hd.getThanhTien());
                long thanhTienGocVe = ct.getDonGia() * ct.getSoLuong();
                r.setThanhTienGoc(thanhTienGocVe);

                // Phân bổ voucher theo tỉ lệ: giamVe = giamHD × (gocVe / gocHD)
                long thanhTienHoaDon = hd.getThanhTien() != null ? hd.getThanhTien() : thanhTienGocHoaDon;
                long giamHoaDon = thanhTienGocHoaDon - thanhTienHoaDon;
                long thanhTienVe;
                if (giamHoaDon > 0 && thanhTienGocHoaDon > 0) {
                    long giamVe = Math.round((double) giamHoaDon * thanhTienGocVe / thanhTienGocHoaDon);
                    thanhTienVe = thanhTienGocVe - giamVe;
                } else {
                    thanhTienVe = thanhTienGocVe;
                }
                r.setThanhTien(thanhTienVe);
            }
            r.setSoLuong(ct.getSoLuong());
            r.setSoLuongHoan(hoanVeCountMap.getOrDefault(hoanKey, 0)); // số ghế approved
            r.setTrangThaiHoan(hoanVeStatusMap.get(hoanKey));
            return r;
        }).toList();
    }

    private int rankTrangThai(String s) {
        return switch (s == null ? "" : s.toLowerCase()) {
            case "pending"  -> 2;
            case "approved" -> 1;
            default         -> 0;
        };
    }
}