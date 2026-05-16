package com.example.ticket.service.impl;

import com.example.ticket.dto.request.*;
import com.example.ticket.dto.response.*;
import com.example.ticket.exception.*;
import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.service.TaiKhoanService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class TaiKhoanServiceImpl implements TaiKhoanService {

    private static final Set<String> LOAI_HOP_LE = Set.of("customer", "creator");

    // FIX 1: @Autowired field injection → constructor injection
    private final TaiKhoanRepository  taiKhoanRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhaToChucRepository nhaToChucRepository;

    public TaiKhoanServiceImpl(TaiKhoanRepository  taiKhoanRepository,
                               KhachHangRepository khachHangRepository,
                               NhaToChucRepository nhaToChucRepository) {
        this.taiKhoanRepository  = taiKhoanRepository;
        this.khachHangRepository = khachHangRepository;
        this.nhaToChucRepository = nhaToChucRepository;
    }

    private TaiKhoan findTaiKhoan(Long id) {
        return taiKhoanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản"));
    }

    private TaiKhoanResponse mapToResponse(TaiKhoan tk) {
        TaiKhoanResponse r = new TaiKhoanResponse();
        r.setMaTaiKhoan(tk.getMaTaiKhoan());
        r.setTenDangNhap(tk.getTenTaiKhoan());
        r.setLoaiTaiKhoan(tk.getLoaiTaiKhoan());
        return r;
    }

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
        if (!tk.getMatKhau().equals(request.getMatKhau())) {
            throw new UnauthorizedException("Sai mật khẩu");
        }
        LoginResponse r = new LoginResponse();
        r.setMaTaiKhoan(tk.getMaTaiKhoan());
        r.setTenDangNhap(tk.getTenTaiKhoan());
        r.setLoaiTaiKhoan(tk.getLoaiTaiKhoan());
        return r;
    }

    @Override
    @Transactional  // FIX 2: thiếu @Transactional → nếu save profile lỗi, TaiKhoan không rollback
    public void register(RegisterRequest request) {
        if (taiKhoanRepository.findByTenTaiKhoan(request.getTenDangNhap()).isPresent()) {
            throw new DuplicateResourceException("Tên tài khoản đã tồn tại");
        }
        if (!LOAI_HOP_LE.contains(request.getLoaiTaiKhoan())) {
            throw new BadRequestException("Loại tài khoản không hợp lệ (customer / creator)");
        }
        TaiKhoan tk = new TaiKhoan();
        tk.setTenTaiKhoan(request.getTenDangNhap());
        tk.setMatKhau(request.getMatKhau());
        tk.setLoaiTaiKhoan(request.getLoaiTaiKhoan());
        TaiKhoan saved = taiKhoanRepository.save(tk);
        if ("customer".equals(saved.getLoaiTaiKhoan())) {
            KhachHang kh = new KhachHang();
            kh.setMaTaiKhoan(saved.getMaTaiKhoan());
            khachHangRepository.save(kh);
        } else {
            NhaToChuc ntc = new NhaToChuc();
            ntc.setMaTaiKhoan(saved.getMaTaiKhoan());
            nhaToChucRepository.save(ntc);
        }
    }

    @Override
    @Transactional
    public TaiKhoanResponse update(Long id, UpdateTaiKhoanRequest request) {
        TaiKhoan existing = findTaiKhoan(id);
        // FIX 3: thiếu kiểm tra trùng tenTaiKhoan khi update
        taiKhoanRepository.findByTenTaiKhoan(request.getTenDangNhap())
                .filter(other -> !other.getMaTaiKhoan().equals(id))
                .ifPresent(other -> { throw new DuplicateResourceException("Tên tài khoản đã được sử dụng"); });
        existing.setTenTaiKhoan(request.getTenDangNhap());
        existing.setMatKhau(request.getMatKhau());
        return mapToResponse(taiKhoanRepository.save(existing));
    }

    @Override
    @Transactional  // FIX 4: xóa KhachHang/NhaToChuc trước → tránh FK violation
    public void delete(Long id) {
        TaiKhoan tk = findTaiKhoan(id);
        khachHangRepository.findByMaTaiKhoan(id).ifPresent(khachHangRepository::delete);
        nhaToChucRepository.findByMaTaiKhoan(id).ifPresent(nhaToChucRepository::delete);
        taiKhoanRepository.delete(tk);
    }

    @Override
    @Transactional  // FIX 5: class readOnly=true → save() không hoạt động nếu không override
    public void forgetPassword(String tenDangNhap) {
        TaiKhoan tk = taiKhoanRepository.findByTenTaiKhoan(tenDangNhap)
                .orElseThrow(() -> new NotFoundException("Tài khoản không tồn tại"));
        tk.setMatKhau("123456");  // TODO: sinh mật khẩu ngẫu nhiên + gửi email
        taiKhoanRepository.save(tk);
    }
}