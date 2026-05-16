package com.example.ticket.service.impl;

import com.example.ticket.dto.request.*;
import com.example.ticket.dto.response.*;

import com.example.ticket.model.KhachHang;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.TaiKhoan;

import com.example.ticket.repository.KhachHangRepository;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.TaiKhoanRepository;

import com.example.ticket.exception.*;

import com.example.ticket.service.TaiKhoanService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaiKhoanServiceImpl implements TaiKhoanService {

    @Autowired
    private TaiKhoanRepository
        taiKhoanRepository;

    @Autowired
    private KhachHangRepository
        khachHangRepository;

    @Autowired
    private NhaToChucRepository
        nhaToChucRepository;
    
    private TaiKhoanResponse mapToResponse(
        TaiKhoan taiKhoan
    ) {

        TaiKhoanResponse response =
            new TaiKhoanResponse();

        response.setMaTaiKhoan(
            taiKhoan.getMaTaiKhoan()
        );

        response.setTenDangNhap(
            taiKhoan.getTenTaiKhoan()
        );

        response.setLoaiTaiKhoan(
            taiKhoan.getLoaiTaiKhoan()
        );

        return response;

    }
    /* =========================
       REGISTER
    ========================= */

    @Override
    public void register(
        RegisterRequest request
    ) {

        boolean exists =
            taiKhoanRepository
            .findByTenTaiKhoan(
                request.getTenDangNhap()
            )
            .isPresent();

        if (exists) {

            throw new RuntimeException(
                "Tên tài khoản đã tồn tại"
            );

        }

        if (
            !request.getLoaiTaiKhoan()
            .equals("customer")

            &&

            !request.getLoaiTaiKhoan()
            .equals("creator")
        ) {

            throw new RuntimeException(
                "Loại tài khoản không hợp lệ"
            );

        }

        TaiKhoan taiKhoan =
            new TaiKhoan();

        taiKhoan.setTenTaiKhoan(
            request.getTenDangNhap()
        );

        taiKhoan.setMatKhau(
            request.getMatKhau()
        );

        taiKhoan.setLoaiTaiKhoan(
            request.getLoaiTaiKhoan()
        );

        TaiKhoan savedTaiKhoan =
            taiKhoanRepository.save(
                taiKhoan
            );

        // customer
        if (
            savedTaiKhoan
            .getLoaiTaiKhoan()
            .equals("customer")
        ) {

            KhachHang kh =
                new KhachHang();

            kh.setMaTaiKhoan(
                savedTaiKhoan
                .getMaTaiKhoan()
            );

            khachHangRepository
                .save(kh);

        }

        // creator
        else {

            NhaToChuc ntc =
                new NhaToChuc();

            ntc.setMaTaiKhoan(
                savedTaiKhoan
                .getMaTaiKhoan()
            );

            nhaToChucRepository
                .save(ntc);

        }

    }

    /* =========================
       LOGIN
    ========================= */

    @Override
    public LoginResponse login(
        LoginRequest request
    ) {

        TaiKhoan tk =
            taiKhoanRepository
            .findByTenTaiKhoan(
                request.getTenDangNhap()
            )

            .orElseThrow(() ->

                new NotFoundException(
                    "Tài khoản không tồn tại"
                )

            );

        if (
            !tk.getMatKhau()
                .equals(request.getMatKhau())
        ) {

            throw new UnauthorizedException(
                "Sai mật khẩu"
            );

        }

        LoginResponse response =
            new LoginResponse();

        response.setMaTaiKhoan(
            tk.getMaTaiKhoan()
        );

        response.setTenDangNhap(
            tk.getTenTaiKhoan()
        );

        response.setLoaiTaiKhoan(
            tk.getLoaiTaiKhoan()
        );

        return response;

    }

    /* =========================
       GET BY ID
    ========================= */

    @Override
    public TaiKhoanResponse getById(
        Long id
    ) {

        TaiKhoan taiKhoan =
            taiKhoanRepository
            .findById(id)

            .orElseThrow(() ->

                new RuntimeException(
                    "Không tìm thấy tài khoản"
                )

            );

        return mapToResponse(
            taiKhoan
        );

    }

    /* =========================
       GET ALL
    ========================= */

    @Override
    public List<TaiKhoanResponse> getAll() {

        return taiKhoanRepository
            .findAll()
            .stream()
            .map(this::mapToResponse)
            .toList();

    }

    /* =========================
       UPDATE
    ========================= */

    @Override
    public TaiKhoanResponse update(
        Long id,
        UpdateTaiKhoanRequest request

    ) {

        TaiKhoan existing =
            taiKhoanRepository
            .findById(id)

            .orElseThrow(() ->

                new RuntimeException(
                    "Không tìm thấy tài khoản"
                )

            );

        existing.setTenTaiKhoan(
            request.getTenDangNhap()
        );

        existing.setMatKhau(
            request.getMatKhau()
        );

        TaiKhoan updated =
            taiKhoanRepository
            .save(existing);

        return mapToResponse(
            updated
        );

    }

    /* =========================
       DELETE
    ========================= */

    @Override
    public void delete(
        Long id
    ) {
        taiKhoanRepository
            .deleteById(id);
    }
    
    /* =========================
        FORGET PASSWORD
     ========================= */

     @Override
     public void forgetPassword(String tenDangNhap) {

         TaiKhoan taiKhoan =
             taiKhoanRepository
             .findByTenTaiKhoan(tenDangNhap)

             .orElseThrow(() ->

                 new NotFoundException(
                     "Tài khoản không tồn tại"
                 )

             );

         // Reset mật khẩu về mặc định
         taiKhoan.setMatKhau("123456");

         taiKhoanRepository.save(taiKhoan);

     }
}

