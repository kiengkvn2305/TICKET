package com.example.ticket.controller;

import com.example.ticket.model.Ghe;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.GheRepository;
import com.example.ticket.repository.VeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}