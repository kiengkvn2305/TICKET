package com.example.ticket.controller;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;
import com.example.ticket.service.VeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ve")
public class VeController {

    private final VeService veService;

    public VeController(VeService veService) {
        this.veService = veService;
    }

    @GetMapping
    public ResponseEntity<List<VeResponse>> getAll() {
        return ResponseEntity.ok(veService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(veService.getById(id));
    }

    @GetMapping("/sukien/{maSuKien}")
    public ResponseEntity<List<VeResponse>> getBySuKien(@PathVariable Long maSuKien) {
        return ResponseEntity.ok(veService.getBySuKien(maSuKien));
    }

    @PostMapping
    public ResponseEntity<VeResponse> create(@RequestBody VeRequest request) {
        return ResponseEntity.ok(veService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeResponse> update(
            @PathVariable Long id,
            @RequestBody VeRequest request) {
        return ResponseEntity.ok(veService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        veService.delete(id);
        return ResponseEntity.noContent().build();
    }
    // VeController.java

    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<VeResponse>> getByCreator(
        @PathVariable Long maTaiKhoan
    ) {
        return ResponseEntity.ok(
            veService.getByCreator(maTaiKhoan)
        );
    }
}