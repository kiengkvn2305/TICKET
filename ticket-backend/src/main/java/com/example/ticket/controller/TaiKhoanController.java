package com.example.ticket.controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.ticket.model.*;
import com.example.ticket.service.*;


@CrossOrigin(origins = "http://localhost:5051")
@RestController
@RequestMapping("/api/taikhoan")
public class TaiKhoanController {
    private final TaiKhoanService service;

    public TaiKhoanController(TaiKhoanService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaiKhoan> getAll() {
        return service.getAll();
    }

    @PostMapping
    public TaiKhoan create(@RequestBody TaiKhoan tk) {
        System.out.println("RECEIVED: " + tk);
        return tk;
        //return service.save(tk);
    }
}
