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

    private final HoaDonRepository       hoaDonRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final KhachHangRepository    khachHangRepository;
    private final VeRepository           veRepository;
    private final SuKienRepository       suKienRepository;
    private final VoucherRepository      voucherRepository;
    private final HoanVeRepository       hoanVeRepository;
    
    public HoaDonServiceImpl(HoaDonRepository hoaDonRepository,
                             ChiTietHoaDonRepository chiTietHoaDonRepository,
                             KhachHangRepository khachHangRepository,
                             VeRepository veRepository,
                             SuKienRepository suKienRepository,
                             VoucherRepository voucherRepository,
                             HoanVeRepository hoanVeRepository) {
        this.hoaDonRepository        = hoaDonRepository;
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
        this.khachHangRepository     = khachHangRepository;
        this.veRepository            = veRepository;
        this.suKienRepository        = suKienRepository;
        this.voucherRepository       = voucherRepository;
        this.hoanVeRepository = hoanVeRepository;
    }

    @Override
    @Transactional
    public MuaVeResponse muaVe(MuaVeRequest request) {
        // 1. Validate đầu vào
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ít nhất 1 vé");
        }

        // 2. Tìm KhachHang
        KhachHang kh = khachHangRepository.findByMaTaiKhoan(request.getMaTaiKhoan())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khách hàng"));

        // 3. Tính tổng tiền gốc, kiểm tra vé tồn tại
        List<Long> maVeList = request.getItems().stream()
                .map(MuaVeRequest.ItemRequest::getMaVe).toList();
        Map<Long, Ve> veMap = veRepository.findAllById(maVeList)
                .stream().collect(Collectors.toMap(Ve::getMaVe, v -> v));

        long thanhTienGoc = 0;
        for (MuaVeRequest.ItemRequest item : request.getItems()) {
            if (!veMap.containsKey(item.getMaVe())) {
                throw new NotFoundException("Không tìm thấy vé ID: " + item.getMaVe());
            }
            if (item.getSoLuong() <= 0) {
                throw new BadRequestException("Số lượng vé phải lớn hơn 0");
            }
            thanhTienGoc += (long)(item.getDonGia() * item.getSoLuong());
        }

        // 4. Áp dụng voucher nếu có
        Double phanTramGiam = null;
        Long   maVoucher    = null;
        long   thanhTienSau = thanhTienGoc;

        if (request.getMaVoucher() != null && !request.getMaVoucher().isBlank()) {
            Voucher voucher = voucherRepository.findByMaCode(request.getMaVoucher().trim())
                    .orElseThrow(() -> new BadRequestException("Mã voucher không tồn tại"));

            if (!"active".equalsIgnoreCase(voucher.getTrangThai())) {
                throw new BadRequestException("Voucher đã hết hạn hoặc không còn hiệu lực");
            }
            if (voucher.getMucKhuyenMai() != null && voucher.getMucKhuyenMai() > 0) {
                phanTramGiam = voucher.getMucKhuyenMai();
                thanhTienSau = Math.round(thanhTienGoc * (1 - phanTramGiam / 100.0));
                maVoucher    = voucher.getMaVoucher();

                // Tăng lượt sử dụng
                voucher.setLuotSuDung(
                    (voucher.getLuotSuDung() == null ? 0 : voucher.getLuotSuDung()) + 1
                );
                voucherRepository.save(voucher);
            }
        }

        // 5. Tạo HoaDon
        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaKhachHang(kh.getMaKhachHang());
        hoaDon.setNgayLap(LocalDate.now());
        hoaDon.setTrangThai("paid");
        hoaDon.setThanhTien(thanhTienSau);
        hoaDon.setMaVoucher(maVoucher);
        HoaDon saved = hoaDonRepository.save(hoaDon);

        // 6. Tạo ChiTietHoaDon cho từng item + tăng daBan của vé
        List<ChiTietHoaDonResponse> chiTietList = new ArrayList<>();
        for (MuaVeRequest.ItemRequest item : request.getItems()) {
            Ve ve = veMap.get(item.getMaVe());

            // Kiểm tra còn đủ vé không
            int conLai = ve.getSoLuong() - ve.getDaBan();
            if (item.getSoLuong() > conLai) {
                throw new BadRequestException(
                    "Vé '" + ve.getTenVe() + "' chỉ còn " + conLai + " vé, không đủ số lượng yêu cầu"
                );
            }

            // Tăng daBan
            ve.setDaBan(ve.getDaBan() + item.getSoLuong());
            veRepository.saveAndFlush(ve);

            ChiTietHoaDonID id = new ChiTietHoaDonID(item.getMaVe(), saved.getMaHoaDon());
            ChiTietHoaDon ct = new ChiTietHoaDon();
            ct.setId(id);
            ct.setDonGia((long) item.getDonGia());
            ct.setSoLuong(item.getSoLuong());
            chiTietHoaDonRepository.save(ct);

            ChiTietHoaDonResponse r = new ChiTietHoaDonResponse();
            r.setMaVe(item.getMaVe());
            r.setMaHoaDon(saved.getMaHoaDon());
            r.setDonGia((long) item.getDonGia());
            r.setSoLuong(item.getSoLuong());
            chiTietList.add(r);
        }

        // 7. Build response
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

    @Override
    public List<VeKhachHangResponse> getVeByKhachHang(Long maTaiKhoan) {
        // 1. Tìm KhachHang
        KhachHang kh = khachHangRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khách hàng"));

        // 2. Lấy tất cả HoaDon của KhachHang
        List<HoaDon> hoaDons = hoaDonRepository.findByMaKhachHang(kh.getMaKhachHang());
        if (hoaDons.isEmpty()) return List.of();

        // 3. Batch load ChiTietHoaDon — tránh N+1
        List<Long> maHoaDonList = hoaDons.stream().map(HoaDon::getMaHoaDon).toList();
        Map<Long, HoaDon> hoaDonMap = hoaDons.stream()
                .collect(Collectors.toMap(HoaDon::getMaHoaDon, h -> h));

        List<ChiTietHoaDon> chiTiets = chiTietHoaDonRepository
                .findByIdMaHoaDonIn(maHoaDonList);
        if (chiTiets.isEmpty()) return List.of();

        // 4. Batch load Ve
        List<Long> maVeList = chiTiets.stream()
                .map(ct -> ct.getId().getMaVe()).distinct().toList();
        Map<Long, Ve> veMap = veRepository.findAllById(maVeList)
                .stream().collect(Collectors.toMap(Ve::getMaVe, v -> v));

        // 5. Batch load SuKien
        List<Long> maSuKienList = veMap.values().stream()
                .map(Ve::getMaSuKien).filter(Objects::nonNull).distinct().toList();
        Map<Long, SuKien> skMap = suKienRepository.findAllById(maSuKienList)
                .stream().collect(Collectors.toMap(SuKien::getMaSuKien, s -> s));

        // 6. Tính thanhTienGoc cho mỗi hóa đơn (tổng donGia*soLuong các dòng)
        Map<Long, Long> thanhTienGocMap = chiTiets.stream()
                .collect(Collectors.groupingBy(
                        ct -> ct.getId().getMaHoaDon(),
                        Collectors.summingLong(ct -> ct.getDonGia() * ct.getSoLuong())
                ));
        List<Long> allMaVe = chiTiets.stream().map(ct -> ct.getId().getMaVe()).distinct().toList();
        Map<String, String> hoanVeMap = new HashMap<>();
        hoanVeRepository.findByMaHoaDonIn(maHoaDonList).forEach(hv ->
            hoanVeMap.put(hv.getMaHoaDon() + "_" + hv.getMaVe(), hv.getTrangThaiHoan())
        );
        // 7. Assemble response
        return chiTiets.stream().map(ct -> {
            Ve      ve = veMap.get(ct.getId().getMaVe());
            HoaDon  hd = hoaDonMap.get(ct.getId().getMaHoaDon());
            SuKien  sk = ve != null && ve.getMaSuKien() != null
                         ? skMap.get(ve.getMaSuKien()) : null;

            VeKhachHangResponse r = new VeKhachHangResponse();
            if (ve != null) {
                r.setMaVe(ve.getMaVe());
                r.setTenVe(ve.getTenVe());
                r.setLoaiVe(ve.getLoaiVe());
                r.setGia(ct.getDonGia());           // giá lúc mua
                r.setTrangThai(ve.getTrangThai());
            }
            if (sk != null) {
                r.setTenSuKien(sk.getTenSuKien());
                r.setThoiGianBatDau(sk.getThoiGianBatDau());
                r.setThoiGianKetThuc(sk.getThoiGianKetThuc());
            }
            if (hd != null) {
                r.setMaHoaDon(hd.getMaHoaDon());
                r.setNgayMua(hd.getNgayLap());
                r.setThanhTien(hd.getThanhTien());
                r.setThanhTienGoc(thanhTienGocMap.getOrDefault(hd.getMaHoaDon(), hd.getThanhTien()));
            }
            r.setSoLuong(ct.getSoLuong());
            String keyHoan = (hd != null ? hd.getMaHoaDon() : 0) + "_" + (ve != null ? ve.getMaVe() : 0);
            r.setTrangThaiHoan(hoanVeMap.get(keyHoan));
            return r;
        }).toList();
    }
}