package com.example.ticket.service.impl;

import com.example.ticket.dto.request.MuaVeRequest;
import com.example.ticket.dto.response.ChiTietHoaDonResponse;
import com.example.ticket.dto.response.MuaVeResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.service.HoaDonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

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
    // muaVe — dùng chung cho cả khách hàng online lẫn nhân viên tại quầy
    // =========================================================================

    @Override
    @Transactional
    public MuaVeResponse muaVe(MuaVeRequest request) {
        return thucHienMuaVe(request);
    }

    /**
     * Nhân viên bán vé tại quầy.
     * Validate thêm: maNhanVien bắt buộc phải có.
     * Sau đó gọi chung thucHienMuaVe().
     */
    @Override
    @Transactional
    public MuaVeResponse muaVeNhanVien(MuaVeRequest request) {
        if (request.getMaNhanVien() == null) {
            throw new BadRequestException("maNhanVien là bắt buộc khi nhân viên bán vé tại quầy");
        }
        return thucHienMuaVe(request);
    }

    // =========================================================================
    // CORE — thucHienMuaVe (logic chính, dùng chung)
    // =========================================================================

    private MuaVeResponse thucHienMuaVe(MuaVeRequest request) {

        // ── BƯỚC 1: Validate đã chọn loại vé ────────────────────────────────
        // Frontend gọi GET /api/ve/sukien/{maSuKien} trước, rồi mới truyền items vào đây
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ít nhất 1 loại vé");
        }
        for (MuaVeRequest.ItemRequest item : request.getItems()) {
            if (item.getSoLuong() <= 0) {
                throw new BadRequestException("Số lượng vé phải lớn hơn 0");
            }
        }

        // ── BƯỚC 2: Validate đã chọn ghế ────────────────────────────────────
        // Frontend gọi GET /api/ghe/sukien/{maSuKien} lấy ghế đã đặt, hiển thị sơ đồ,
        // user chọn ghế trống rồi truyền ghes vào đây
        int tongSoLuong = request.getItems().stream()
                .mapToInt(MuaVeRequest.ItemRequest::getSoLuong).sum();

        if (request.getGhes() == null || request.getGhes().isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ghế ngồi");
        }
        if (request.getGhes().size() != tongSoLuong) {
            throw new BadRequestException(
                "Số ghế đã chọn (" + request.getGhes().size()
                + ") phải bằng tổng số vé (" + tongSoLuong + ")"
            );
        }

        // Không được chọn 2 ghế giống nhau trong cùng request
        long distinctGhe = request.getGhes().stream()
                .map(MuaVeRequest.GheRequest::getKhuVuc).distinct().count();
        if (distinctGhe != request.getGhes().size()) {
            throw new BadRequestException("Danh sách ghế có khu vực bị trùng");
        }

        // Không được chọn ghế đã có người đặt
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

        // ── Tìm/tạo KhachHang ────────────────────────────────────────────────
        KhachHang kh;
        if (request.getMaTaiKhoan() != null) {
            kh = khachHangRepository.findFirstByMaTaiKhoan(request.getMaTaiKhoan())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy khách hàng"));
        } else {
            kh = khachHangRepository.save(new KhachHang());
        }

        // ── Validate nhân viên ────────────────────────────────────────────────
        if (request.getMaNhanVien() != null
                && !nhanVienRepository.existsById(request.getMaNhanVien())) {
            throw new NotFoundException("Không tìm thấy nhân viên ID: " + request.getMaNhanVien());
        }

        // ── Kiểm tra tồn kho vé ──────────────────────────────────────────────
        List<Long> maVeList = request.getItems().stream()
                .map(MuaVeRequest.ItemRequest::getMaVe).toList();
        Map<Long, Ve> veMap = veRepository.findAllByIdWithLock(maVeList)
                .stream().collect(Collectors.toMap(Ve::getMaVe, v -> v));

        long thanhTienGoc = 0;
        for (MuaVeRequest.ItemRequest item : request.getItems()) {
            Ve ve = veMap.get(item.getMaVe());
            if (ve == null) {
                throw new NotFoundException("Không tìm thấy vé ID: " + item.getMaVe());
            }
            int conLai = ve.getSoLuong() - ve.getDaBan();
            if (item.getSoLuong() > conLai) {
                throw new BadRequestException("Vé '" + ve.getTenVe() + "' chỉ còn " + conLai + " vé");
            }
            thanhTienGoc += (long)(ve.getGia() * item.getSoLuong());
        }

        // ── BƯỚC 3: Áp dụng voucher (tùy chọn) ─────────────────────────────
        // Frontend gọi GET /api/voucher/sukien/{maSuKien} lấy danh sách,
        // user chọn rồi truyền maVoucher vào đây (hoặc để null nếu bỏ qua)
        Double phanTramGiam = null;
        Long   maVoucherSave = null;
        long   thanhTienSau  = thanhTienGoc;

        if (request.getMaVoucher() != null && !request.getMaVoucher().isBlank()) {
            Voucher voucher = voucherRepository.findByCodeWithLock(request.getMaVoucher().trim())
                    .orElseThrow(() -> new BadRequestException("Mã voucher không tồn tại"));

            if (!"active".equalsIgnoreCase(voucher.getTrangThai())) {
                throw new BadRequestException("Voucher đã hết hạn hoặc không còn hiệu lực");
            }

            // Kiểm tra voucher có áp dụng cho sự kiện này không (nếu có maSuKien)
            if (request.getMaSuKien() != null
                    && voucher.getDanhSachSuKien() != null
                    && !voucher.getDanhSachSuKien().isBlank()) {
                boolean thuocSuKien = Arrays.stream(voucher.getDanhSachSuKien().split(","))
                        .map(String::trim)
                        .map(Long::parseLong)
                        .anyMatch(id -> id.equals(request.getMaSuKien()));
                if (!thuocSuKien) {
                    throw new BadRequestException("Voucher này không áp dụng cho sự kiện đang chọn");
                }
            }

            if (voucher.getMucKhuyenMai() != null && voucher.getMucKhuyenMai() > 0) {
                phanTramGiam  = voucher.getMucKhuyenMai();
                thanhTienSau  = Math.round(thanhTienGoc * (1 - phanTramGiam / 100.0));
                maVoucherSave = voucher.getMaVoucher();
                voucher.setLuotSuDung(
                    (voucher.getLuotSuDung() == null ? 0 : voucher.getLuotSuDung()) + 1
                );
                voucherRepository.save(voucher);
            }
        }

        // ── Tạo HoaDon ───────────────────────────────────────────────────────
        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaKhachHang(kh.getMaKhachHang());
        hoaDon.setNgayLap(LocalDate.now());
        hoaDon.setTrangThai("pending");
        hoaDon.setThanhTien(thanhTienSau);
        hoaDon.setMaVoucher(maVoucherSave);
        hoaDon.setMaNhanVien(request.getMaNhanVien());
        HoaDon saved = hoaDonRepository.save(hoaDon);

        // ── Tạo ChiTietHoaDon + tăng daBan ───────────────────────────────────
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

        // ── Lưu ghế đã chọn ──────────────────────────────────────────────────
        for (MuaVeRequest.GheRequest gr : request.getGhes()) {
            Ghe ghe = new Ghe();
            ghe.setKhuVuc(gr.getKhuVuc());
            ghe.setMaVe(gr.getMaVe());
            ghe.setMaHoaDon(saved.getMaHoaDon());
            ghe.setTrangThai("da_dat");
            gheRepository.save(ghe);
        }

        // ── Response ──────────────────────────────────────────────────────────
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
        List<HoaDon> hoaDons = hoaDonRepository.findByMaKhachHang(kh.getMaKhachHang());
        if (hoaDons.isEmpty()) return List.of();
        return buildResponseList(hoaDons);
    }

    @Override
    public List<VeKhachHangResponse> getAllVe() {
        List<HoaDon> hoaDons = hoaDonRepository.findAll();
        if (hoaDons.isEmpty()) return List.of();
        return buildResponseList(hoaDons);
    }

    @Override
    public List<VeKhachHangResponse> getVeByNhanVien(Long maNhanVien) {
        List<HoaDon> hoaDons = hoaDonRepository.findByMaNhanVien(maNhanVien);
        if (hoaDons.isEmpty()) return List.of();
        return buildResponseList(hoaDons);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private List<VeKhachHangResponse> buildResponseList(List<HoaDon> hoaDons) {
        List<Long> maHoaDonList = hoaDons.stream().map(HoaDon::getMaHoaDon).toList();
        Map<Long, HoaDon> hoaDonMap = hoaDons.stream()
                .collect(Collectors.toMap(HoaDon::getMaHoaDon, h -> h));

        List<ChiTietHoaDon> chiTiets = chiTietHoaDonRepository.findByIdMaHoaDonIn(maHoaDonList);
        if (chiTiets.isEmpty()) return List.of();

        List<Long> maVeList = chiTiets.stream()
                .map(ct -> ct.getId().getMaVe()).distinct().toList();
        Map<Long, Ve> veMap = veRepository.findAllByIdWithLock(maVeList)
                .stream().collect(Collectors.toMap(Ve::getMaVe, v -> v));

        List<Long> maSuKienList = veMap.values().stream()
                .map(Ve::getMaSuKien).filter(Objects::nonNull).distinct().toList();
        Map<Long, SuKien> skMap = suKienRepository.findAllById(maSuKienList)
                .stream().collect(Collectors.toMap(SuKien::getMaSuKien, s -> s));

        // Lấy ghế đã đặt theo maHoaDon — đúng theo từng khách, không lẫn ghế người khác
        Map<String, List<String>> gheMap = gheRepository.findByMaHoaDonIn(maHoaDonList)
                .stream()
                .collect(Collectors.groupingBy(
                        g -> g.getMaHoaDon() + "_" + g.getMaVe(),
                        Collectors.mapping(Ghe::getKhuVuc, Collectors.toList())
                ));

        Map<Long, Long> thanhTienGocMap = chiTiets.stream()
                .collect(Collectors.groupingBy(
                        ct -> ct.getId().getMaHoaDon(),
                        Collectors.summingLong(ct -> ct.getDonGia() * ct.getSoLuong())
                ));

        Map<String, String> hoanVeMap = new HashMap<>();
        hoanVeRepository.findByMaHoaDonIn(maHoaDonList).forEach(hv ->
                hoanVeMap.put(hv.getMaHoaDon() + "_" + hv.getMaVe(), hv.getTrangThaiHoan()));

        return chiTiets.stream().map(ct -> {
            Ve     ve = veMap.get(ct.getId().getMaVe());
            HoaDon hd = hoaDonMap.get(ct.getId().getMaHoaDon());
            SuKien sk = ve != null && ve.getMaSuKien() != null ? skMap.get(ve.getMaSuKien()) : null;

            VeKhachHangResponse r = new VeKhachHangResponse();
            if (ve != null) {
                r.setMaVe(ve.getMaVe());
                r.setTenVe(ve.getTenVe());
                r.setLoaiVe(ve.getLoaiVe());
                r.setGia(ct.getDonGia());
                r.setTrangThai(ve.getTrangThai());
            }
            if (sk != null) {
                r.setTenSuKien(sk.getTenSuKien());
                r.setThoiGianBatDau(sk.getThoiGianBatDau());
                r.setThoiGianKetThuc(sk.getThoiGianKetThuc());
            }
            if (ve != null) {
                r.setMaSuKien(ve.getMaSuKien());
                String gheKey = (hd != null ? hd.getMaHoaDon() : 0) + "_" + ve.getMaVe();
                r.setGheDat(gheMap.getOrDefault(gheKey, List.of()));
            }
            if (hd != null) {
                r.setMaHoaDon(hd.getMaHoaDon());
                r.setNgayMua(hd.getNgayLap());
                r.setThanhTien(hd.getThanhTien());
                r.setThanhTienGoc(thanhTienGocMap.getOrDefault(
                        hd.getMaHoaDon(), hd.getThanhTien()));
            }
            r.setSoLuong(ct.getSoLuong());
            r.setTrangThaiHoan(hoanVeMap.get(
                    (hd != null ? hd.getMaHoaDon() : 0)
                    + "_" + (ve != null ? ve.getMaVe() : 0)));
            return r;
        }).toList();
    }
}