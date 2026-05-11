package com.example.ticket.service.impl;

import com.example.ticket.model.TaiKhoan;
import com.example.ticket.repository.TaiKhoanRepository;
import com.example.ticket.service.TaiKhoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaiKhoanServiceImple implements TaiKhoanService {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    // Đăng ký
    @Override
    public TaiKhoan register(TaiKhoan taiKhoan) {

        // check trùng username
        if (taiKhoanRepository.findByTenTaiKhoan(taiKhoan.getTenTaiKhoan()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        return taiKhoanRepository.save(taiKhoan);
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