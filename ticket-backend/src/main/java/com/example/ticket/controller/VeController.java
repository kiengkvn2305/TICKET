package com.example.ticket.controller;
import com.example.ticket.model.Ve;
import com.example.ticket.service.VeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ve")

public class VeController {

    @Autowired
    private VeService veService;

    @GetMapping
    public List<Ve> getAllVe() {
        return veService.getAll();
    }

}