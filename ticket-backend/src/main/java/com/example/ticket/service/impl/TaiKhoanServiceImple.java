package com.example.ticket.service.impl;

import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaiKhoanServiceImple implements TaiKhoanService {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private KhachHangRepository khachHangRepository;

    @Autowired
    private NhaToChucRepository nhaToChucRepository;
    
    
    // Đăng ký
    @Override
    public TaiKhoan register(TaiKhoan taiKhoan) {

        // check username
        if (taiKhoanRepository
                .findByTenTaiKhoan(taiKhoan.getTenTaiKhoan()).isPresent()){

            throw new RuntimeException(
                "Username already exists"
            );
        }

        // lưu tài khoản trước
        TaiKhoan savedTaiKhoan = taiKhoanRepository.save(taiKhoan);

        // nếu customer
        if (savedTaiKhoan.getLoaiTaiKhoan().equals("customer")) {
            KhachHang kh = new KhachHang();
            kh.setMaTaiKhoan(
                savedTaiKhoan.getMaTaiKhoan()
            );

            khachHangRepository.save(kh);

        }

        // nếu creator
        else if (savedTaiKhoan.getLoaiTaiKhoan()
                .equals("creator")) {

            NhaToChuc ntc =
                    new NhaToChuc();

            ntc.setMaTaiKhoan(
                savedTaiKhoan.getMaTaiKhoan()
            );

            nhaToChucRepository.save(ntc);

        }

        return savedTaiKhoan;
    }

    // Đăng nhập
    
    @Override
    public TaiKhoan login(String username, String password) {

        System.out.println("USERNAME: " + username);
        System.out.println("PASSWORD: " + password);

        TaiKhoan tk = taiKhoanRepository
            .findByTenTaiKhoanAndMatKhau(username, password)
            .orElseThrow(() ->
                new RuntimeException("Sai tài khoản hoặc mật khẩu"));

        System.out.println("FOUND USER: " + tk.getTenTaiKhoan());
        System.out.println("ROLE: " + tk.getLoaiTaiKhoan());

        return tk;
    }

    // Lấy theo ID
    @Override
    public TaiKhoan getById(Long id) {
        return taiKhoanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Lấy tất cả
    @Override
    public List<TaiKhoan> getAll() {
        return taiKhoanRepository.findAll();
    }

    // Update
    @Override
    public TaiKhoan update(Long id, TaiKhoan taiKhoan) {

        TaiKhoan existing = getById(id);

        existing.setTenTaiKhoan(taiKhoan.getTenTaiKhoan());
        existing.setMatKhau(taiKhoan.getMatKhau());

        return taiKhoanRepository.save(existing);
    }

    // Delete
    @Override
    public void delete(Long id) {
        taiKhoanRepository.deleteById(id);
    }
}