package com.example.ticket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket.model.Ghe;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.GheRepository;
import com.example.ticket.repository.VeRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ghe")
public class GheController {

    private final GheRepository gheRepository;
    private final VeRepository  veRepository;

    public GheController(GheRepository gheRepository, VeRepository veRepository) {
        this.gheRepository = gheRepository;
        this.veRepository  = veRepository;
    }

    /**
     * Lấy danh sách ghế đã đặt theo sự kiện.
     * GET /api/ghe/sukien/{maSuKien}
     * Trả về: [{maGhe, khuVuc, trangThai, maVe}, ...]
     */
    @GetMapping("/sukien/{maSuKien}")
    public ResponseEntity<List<Ghe>> getGheBySuKien(@PathVariable Long maSuKien) {
        List<Long> maVeList = veRepository.findByMaSuKien(maSuKien)
                .stream().map(Ve::getMaVe).toList();
        if (maVeList.isEmpty()) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(gheRepository.findByMaVeIn(maVeList));
    }

    @GetMapping
    public ResponseEntity<List<Ghe>> getGheByVeAndHoaDon(
            @RequestParam Long maVe,
            @RequestParam Long maHoaDon) {
        List<Ghe> danhSachGhe = gheRepository.findByMaVeAndMaHoaDon(maVe, maHoaDon);
        return ResponseEntity.ok(danhSachGhe);
    }   
}