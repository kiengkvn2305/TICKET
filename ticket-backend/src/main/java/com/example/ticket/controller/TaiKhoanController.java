package com.example.ticket.controller;

import com.example.ticket.dto.request.LoginRequest;
import com.example.ticket.dto.request.RegisterRequest;
import com.example.ticket.dto.response.LoginResponse;
import com.example.ticket.dto.request.UpdateTaiKhoanRequest;

import com.example.ticket.dto.response.TaiKhoanResponse;
import com.example.ticket.model.TaiKhoan;

import com.example.ticket.service.TaiKhoanService;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/taikhoan")

public class TaiKhoanController {

    private final TaiKhoanService service;

    public TaiKhoanController(TaiKhoanService service) {
        this.service = service;
    }

    /* =========================
       GET ALL
    ========================= */

    @GetMapping
    public List<TaiKhoanResponse> getAll() {
        return service.getAll();
    }
    /* =========================
       GET BY ID
    ========================= */
    
    @GetMapping("/{id}")
    public TaiKhoanResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }
    
    /* =========================
       LOGIN
    ========================= */

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        return service.login(request);

    }

    /* =========================
       REGISTER
    ========================= */

    @PostMapping("/register")
    public void register(
        @RequestBody RegisterRequest request
    ) {

        service.register(request);

    }

    /* =========================
       UPDATE
    ========================= */
    @PutMapping("/{id}")
    public TaiKhoanResponse update(@PathVariable Long id, @RequestBody UpdateTaiKhoanRequest request) {
        return service.update(id, request);
    }
}