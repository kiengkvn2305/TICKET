package com.example.ticket.controller;

import com.example.ticket.dto.request.ChiTietHoaDonRequest;
import com.example.ticket.dto.response.ChiTietHoaDonResponse;
import com.example.ticket.service.ChiTietHoaDonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/chitiethoadon")
public class ChiTietHoaDonController {

    private final ChiTietHoaDonService service;

    public ChiTietHoaDonController(ChiTietHoaDonService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ChiTietHoaDonResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<ChiTietHoaDonResponse> create(@RequestBody ChiTietHoaDonRequest request) {
        return ResponseEntity.ok(service.create(request));
    }
}