package com.example.ticket.service;
import com.example.ticket.model.TaiKhoan;
import java.util.List;

public interface TaiKhoanService {

    TaiKhoan register(TaiKhoan taiKhoan);

    TaiKhoan login(String username, String password);

    TaiKhoan getById(Long id);

    List<TaiKhoan> getAll();

    TaiKhoan update(Long id, TaiKhoan taiKhoan);

    void delete(Long id);
}