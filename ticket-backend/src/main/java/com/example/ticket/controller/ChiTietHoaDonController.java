package com.example.ticket.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.ticket.model.*;
import com.example.ticket.service.*;

@RestController
@RequestMapping("/api/chitiethoadon")
public class ChiTietHoaDonController {

    private final ChiTietHoaDonService service;

    public ChiTietHoaDonController(ChiTietHoaDonService service) {
        this.service = service;
    }

    @GetMapping
    public List<ChiTietHoaDon> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ChiTietHoaDon create(@RequestBody ChiTietHoaDon ct) {
        System.out.println("RECEIVED: " + ct);
        System.out.println(ct.getID());
        return service.save(ct);
    }
}