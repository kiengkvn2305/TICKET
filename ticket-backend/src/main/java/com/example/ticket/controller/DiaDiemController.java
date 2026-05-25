package com.example.ticket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket.model.DiaDiem;
import com.example.ticket.service.DiaDiemService;

@RestController
@RequestMapping("/api/diadiem")
@CrossOrigin(origins = "*")
public class DiaDiemController {

    private final DiaDiemService diaDiemService;

    public DiaDiemController(DiaDiemService diaDiemService) {
        this.diaDiemService = diaDiemService;
    }

    @GetMapping
    public ResponseEntity<List<DiaDiem>> getAll() {
        return ResponseEntity.ok(diaDiemService.getAll());
    }
    
    @GetMapping("/{maDiaDiem}")
    public ResponseEntity<DiaDiem> getById(@PathVariable Long maDiaDiem) {
        return diaDiemService.getById(maDiaDiem)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
}