package com.example.ticket.controller;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;

import com.example.ticket.service.SuKienService;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")

@RestController

@RequestMapping("/api/sukien")

public class SuKienController {

    private final SuKienService suKienService;

    public SuKienController(
        SuKienService suKienService
    ) {

        this.suKienService =
            suKienService;
    }

    @GetMapping
    public List<SuKienResponse> getAll() {

        return suKienService.getAll();
    }

    @GetMapping("/{id}")
    public SuKienResponse getById(@PathVariable Long id) {
        return suKienService.getById(id);
    }
    
    @PostMapping
    public SuKienResponse create(
        @RequestBody SuKienRequest request
    ) {

        return suKienService.create(request);
    }

    @PutMapping("/{id}")
    public SuKienResponse update(
        @PathVariable Long id,
        @RequestBody SuKienRequest request
    ) {

        return suKienService.update(
            id,
            request
        );
    }

    @DeleteMapping("/{id}")
    public String delete(
        @PathVariable Long id
    ) {

        suKienService.delete(id);

        return "Xóa sự kiện thành công";
    }

    @GetMapping("/creator/{maTaiKhoan}")
    public List<SuKienResponse> getByCreator(
        @PathVariable Long maTaiKhoan
    ) {

        return suKienService.getByCreator(
            maTaiKhoan
        );
    }
    

}