package com.example.ticket.controller;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;

import com.example.ticket.service.VeService;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ve")

public class VeController {

    private final VeService veService;

    public VeController(VeService veService) {
        this.veService = veService;
    }

    /* =========================
       CREATE
    ========================= */

    @PostMapping
    public VeResponse create(@RequestBody VeRequest request) {
        return veService.create(request);
    }

    /* =========================
       GET ALL
    ========================= */

    @GetMapping
    public List<VeResponse> getAll() {

        return veService.getAll();

    }

    /* =========================
       GET BY ID
    ========================= */

    @GetMapping("/{id}")
    public VeResponse getById(
        @PathVariable Long id
    ) {

        return veService.getById(id);

    }

    /* =========================
       UPDATE
    ========================= */

    @PutMapping("/{id}")

    public VeResponse update(

        @PathVariable Long id,

        @RequestBody
        VeRequest request

    ) {

        return veService.update(
            id,
            request
        );

    }

    /* =========================
       DELETE
    ========================= */

    @DeleteMapping("/{id}")

    public void delete(
        @PathVariable Long id
    ) {

        veService.delete(id);

    }

}