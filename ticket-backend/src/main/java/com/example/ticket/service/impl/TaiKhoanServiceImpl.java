package com.example.ticket.service.impl;

import com.example.ticket.dto.request.*;
import com.example.ticket.dto.response.*;
import com.example.ticket.exception.*;
import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.service.TaiKhoanService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class TaiKhoanServiceImpl implements TaiKhoanService {

    private static final Set<String> LOAI_HOP_LE = Set.of("Nhân viên", "Nhà tổ chức", "Khách hàng");

    private final TaiKhoanRepository  taiKhoanRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhaToChucRepository nhaToChucRepository;
    private final NhanVienRepository  nhanVienRepository;
    private final PasswordEncoder     passwordEncoder;


    public TaiKhoanServiceImpl(TaiKhoanRepository  taiKhoanRepository,
                               KhachHangRepository khachHangRepository,
                               NhaToChucRepository nhaToChucRepository,
                               NhanVienRepository  nhanVienRepository,
                               PasswordEncoder     passwordEncoder) {
        this.taiKhoanRepository  = taiKhoanRepository;
        this.khachHangRepository = khachHangRepository;
        this.nhaToChucRepository = nhaToChucRepository;
        this.nhanVienRepository  = nhanVienRepository;
        this.passwordEncoder     = passwordEncoder;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private TaiKhoan findTaiKhoan(Long id) {
        return taiKhoanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản"));
    }

    private TaiKhoanResponse mapToResponse(TaiKhoan tk) {
        TaiKhoanResponse r = new TaiKhoanResponse();
        r.setMaTaiKhoan(tk.getMaTaiKhoan());
        r.setTenDangNhap(tk.getTenTaiKhoan());
        r.setLoaiTaiKhoan(tk.getLoaiTaiKhoan());
        r.setTrangThai(tk.getTrangThai() != null ? tk.getTrangThai() : "active");
        return r;
    }

    // ── queries ───────────────────────────────────────────────────────────────

    @Override
    public List<TaiKhoanResponse> getAll() {
        return taiKhoanRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Override
    public TaiKhoanResponse getById(Long id) {
        return mapToResponse(findTaiKhoan(id));
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        TaiKhoan tk = taiKhoanRepository.findByTenTaiKhoan(request.getTenDangNhap())
                .orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));

        if (!passwordEncoder.matches(request.getMatKhau(), tk.getMatKhau())) {
            throw new UnauthorizedException("Sai mật khẩu");
        }

        // FIX 1: đúng tên biến (tk), đúng cách check trangThai thay vì isBiBan()
        if ("blocked".equals(tk.getTrangThai())) {
            throw new UnauthorizedException("Tài khoản của bạn đã bị khóa.");
        }

        LoginResponse r = new LoginResponse();
        r.setMaTaiKhoan(tk.getMaTaiKhoan());
        r.setTenDangNhap(tk.getTenTaiKhoan());
        r.setLoaiTaiKhoan(tk.getLoaiTaiKhoan());

        // Gắn ID nghiệp vụ tương ứng với từng loại tài khoản
        switch (tk.getLoaiTaiKhoan() == null ? "" : tk.getLoaiTaiKhoan()) {
            case "Nhân viên" ->
                nhanVienRepository.findByMaTaiKhoan(tk.getMaTaiKhoan())
                        .ifPresent(nv -> r.setMaNhanVien(nv.getMaNhanVien()));
            case "Nhà tổ chức" ->
                nhaToChucRepository.findByMaTaiKhoan(tk.getMaTaiKhoan())
                        .ifPresent(ntc -> r.setMaNhaToChuc(ntc.getMaCongTy()));
            case "Khách hàng" ->
                khachHangRepository.findByMaTaiKhoan(tk.getMaTaiKhoan())
                        .ifPresent(kh -> r.setMaKhachHang(kh.getMaKhachHang()));
            // Quản lý: không có bảng riêng, dùng maTaiKhoan là đủ
        }

        return r;
    }

    @Override
    public HoSoResponse getHoSo(Long id) {
        TaiKhoan tk = findTaiKhoan(id);
        HoSoResponse r = new HoSoResponse();
        r.setMaTaiKhoan(tk.getMaTaiKhoan());
        r.setTenDangNhap(tk.getTenTaiKhoan());
        r.setLoaiTaiKhoan(tk.getLoaiTaiKhoan());

        if ("Khách hàng".equals(tk.getLoaiTaiKhoan())) {
            khachHangRepository.findByMaTaiKhoan(id).ifPresent(kh -> {
                r.setTenKhachHang(kh.getTenKhachHang());
                r.setEmail(kh.getEmail());
                r.setSoDienThoai(kh.getSoDienThoai());
            });
        } else if ("Nhà tổ chức".equals(tk.getLoaiTaiKhoan())){
            nhaToChucRepository.findByMaTaiKhoan(id).ifPresent(ntc -> {
                r.setTenCongTy(ntc.getTenCongTy());
                r.setTenNguoiDaiDien(ntc.getTenNguoiDaiDien());
                r.setDiaChi(ntc.getDiaChi());
                r.setEmail(ntc.getEmail());
                r.setSoDienThoai(ntc.getSoDienThoai());
            });
        } else if ("Nhân viên".equals(tk.getLoaiTaiKhoan())){
            nhanVienRepository.findByMaTaiKhoan(id).ifPresent(nv -> {
                r.setTenNhanVien(nv.getTenNhanVien());
                r.setNgayVaoLam(nv.getNgayVaoLam());
                r.setEmail(nv.getEmail());
                r.setSoDienThoai(nv.getSoDienThoai());
            });
        }
        return r;
    }

    // ── commands ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (taiKhoanRepository.findByTenTaiKhoan(request.getTenDangNhap()).isPresent()) {
            throw new DuplicateResourceException("Tên tài khoản đã tồn tại");
        }
        if (!LOAI_HOP_LE.contains(request.getLoaiTaiKhoan())) {
            throw new BadRequestException("Loại tài khoản không hợp lệ (Nhà tổ chức / Khách hàng / Nhân viên)");
        }

        TaiKhoan tk = new TaiKhoan();
        tk.setTenTaiKhoan(request.getTenDangNhap());
        tk.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        tk.setLoaiTaiKhoan(request.getLoaiTaiKhoan());
        TaiKhoan saved = taiKhoanRepository.save(tk);

        if ("Khách hàng".equals(saved.getLoaiTaiKhoan())) {
            KhachHang kh = new KhachHang();
            kh.setMaTaiKhoan(saved.getMaTaiKhoan());
            khachHangRepository.save(kh);
        } else if ("Nhà tổ chức".equals(saved.getLoaiTaiKhoan())) {
            NhaToChuc ntc = new NhaToChuc();
            ntc.setMaTaiKhoan(saved.getMaTaiKhoan());
            nhaToChucRepository.save(ntc);
        } else {
            NhanVien nv = new NhanVien();
            nv.setMaTaiKhoan(saved.getMaTaiKhoan());
            nhanVienRepository.save(nv);
        }
    }

    @Override
    @Transactional
    public TaiKhoanResponse update(Long id, UpdateTaiKhoanRequest request) {
        TaiKhoan existing = findTaiKhoan(id);
        taiKhoanRepository.findByTenTaiKhoan(request.getTenDangNhap())
                .filter(other -> !other.getMaTaiKhoan().equals(id))
                .ifPresent(other -> { throw new DuplicateResourceException("Tên tài khoản đã được sử dụng"); });
        existing.setTenTaiKhoan(request.getTenDangNhap());
        existing.setMatKhau(passwordEncoder.encode(request.getMatKhau()));
        return mapToResponse(taiKhoanRepository.save(existing));
    }

    @Override
    @Transactional
    public void doiMatKhau(Long id, DoiMatKhauRequest request) {
        TaiKhoan tk = findTaiKhoan(id);

        if (!passwordEncoder.matches(request.getMatKhauCu(), tk.getMatKhau())) {
            throw new UnauthorizedException("Mật khẩu cũ không đúng");
        }

        if (!request.getMatKhauMoi().equals(request.getXacNhanMatKhau())) {
            throw new BadRequestException("Xác nhận mật khẩu không khớp");
        }

        if (passwordEncoder.matches(request.getMatKhauMoi(), tk.getMatKhau())) {
            throw new BadRequestException("Mật khẩu mới không được trùng mật khẩu cũ");
        }

        if (request.getMatKhauMoi().length() < 6) {
            throw new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        tk.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        taiKhoanRepository.save(tk);
    }

    @Override
    @Transactional
    public HoSoResponse updateHoSo(Long id, HoSoRequest request) {
        TaiKhoan tk = findTaiKhoan(id);

        if ("Khách hàng".equals(tk.getLoaiTaiKhoan())) {
            KhachHang kh = khachHangRepository.findByMaTaiKhoan(id)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ khách hàng"));
            kh.setTenKhachHang(request.getTenKhachHang());
            kh.setEmail(request.getEmail());
            kh.setSoDienThoai(request.getSoDienThoai());
            khachHangRepository.save(kh);
        } else if ("Nhà tổ chức".equals(tk.getLoaiTaiKhoan())){
            NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(id)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ nhà tổ chức"));
            ntc.setTenCongTy(request.getTenCongTy());
            ntc.setTenNguoiDaiDien(request.getTenNguoiDaiDien());
            ntc.setDiaChi(request.getDiaChi());
            ntc.setEmail(request.getEmail());
            ntc.setSoDienThoai(request.getSoDienThoai());
            nhaToChucRepository.save(ntc);
        } else if ("Nhân viên".equals(tk.getLoaiTaiKhoan())){
            NhanVien nv = nhanVienRepository.findByMaTaiKhoan(id)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ nhân viên"));
            nv.setTenNhanVien(request.getTenNhanVien());
            nv.setNgayVaoLam(request.getNgayVaoLam());
            nv.setEmail(request.getEmail());
            nv.setSoDienThoai(request.getSoDienThoai());
            nhanVienRepository.save(nv);
        }

        return getHoSo(id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        TaiKhoan tk = findTaiKhoan(id);
        if ("Quản lý".equals(tk.getLoaiTaiKhoan()))
            throw new BadRequestException("Không thể xoá tài khoản quản lý");
        khachHangRepository.findByMaTaiKhoan(id).ifPresent(khachHangRepository::delete);
        nhaToChucRepository.findByMaTaiKhoan(id).ifPresent(nhaToChucRepository::delete);
        nhanVienRepository.findByMaTaiKhoan(id).ifPresent(nhanVienRepository::delete);
        taiKhoanRepository.delete(tk);
    }

    @Override
    @Transactional
    public void forgetPassword(String tenDangNhap) {
        TaiKhoan tk = taiKhoanRepository.findByTenTaiKhoan(tenDangNhap)
                .orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));
        tk.setMatKhau(passwordEncoder.encode("123456"));
        taiKhoanRepository.save(tk);
    }

    @Override
    @Transactional
    public void block(Long id) {
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản #" + id));
        if ("Quản lý".equals(tk.getLoaiTaiKhoan()))
            throw new BadRequestException("Không thể chặn tài khoản quản lý");
        tk.setTrangThai("blocked");
        taiKhoanRepository.save(tk);
    }

    @Override
    @Transactional
    public void unblock(Long id) {
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản #" + id));
        tk.setTrangThai("active");
        taiKhoanRepository.save(tk);
    }

    @Override
    @Transactional
    public void resetPassword(Long id, String matKhauMoi) {
        if (matKhauMoi == null || matKhauMoi.isBlank())
            throw new BadRequestException("Mật khẩu mới không được để trống");
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản #" + id));
        tk.setMatKhau(passwordEncoder.encode(matKhauMoi));
        taiKhoanRepository.save(tk);
    }

    @Override
    @Transactional
    public void changeRole(Long id, String loaiTaiKhoan) {
        if (loaiTaiKhoan == null || loaiTaiKhoan.isBlank())
            throw new BadRequestException("Loại tài khoản không hợp lệ");
        TaiKhoan tk = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản #" + id));
        if ("Quản lý".equals(tk.getLoaiTaiKhoan()))
            throw new BadRequestException("Không thể đổi vai trò của tài khoản quản lý");
        tk.setLoaiTaiKhoan(loaiTaiKhoan);
        taiKhoanRepository.save(tk);
    }
}