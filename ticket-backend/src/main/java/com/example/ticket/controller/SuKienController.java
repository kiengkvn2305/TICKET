package com.example.ticket.controller;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;
import com.example.ticket.service.SuKienService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/sukien")
public class SuKienController {

    private final SuKienService suKienService;

    public SuKienController(SuKienService suKienService) {
        this.suKienService = suKienService;
    }

    @GetMapping
    public ResponseEntity<List<SuKienResponse>> getAll() {
        return ResponseEntity.ok(suKienService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuKienResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(suKienService.getById(id));
    }

    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<SuKienResponse>> getByCreator(@PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(suKienService.getByCreator(maTaiKhoan));
    }

    @PostMapping
    public ResponseEntity<SuKienResponse> create(@RequestBody SuKienRequest request) {
        return ResponseEntity.ok(suKienService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuKienResponse> update(
            @PathVariable Long id,
            @RequestBody SuKienRequest request) {
        return ResponseEntity.ok(suKienService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        suKienService.delete(id);
        return ResponseEntity.noContent().build();
    }
}