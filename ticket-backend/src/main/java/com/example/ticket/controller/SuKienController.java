package com.example.ticket.controller;

import com.example.ticket.model.SuKien;
import com.example.ticket.service.SuKienService;
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

    // GET ALL
    @GetMapping
    public List<SuKien> getAll() {
        return suKienService.getAll();
    }

    // CREATE
    @PostMapping
    public SuKien create(@RequestBody SuKien suKien){
        return suKienService.create(suKien);
    }

    // UPDATE
    @PutMapping("/{id}")
    public SuKien update(@PathVariable Long id, @RequestBody SuKien suKien) {
        return suKienService.update(id, suKien);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        suKienService.delete(id);
        return "Xóa sự kiện thành công";
    }
}