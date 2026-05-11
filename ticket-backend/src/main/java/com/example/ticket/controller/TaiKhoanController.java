package com.example.ticket.controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.ticket.model.*;
import com.example.ticket.service.*;
import org.springframework.http.ResponseEntity;


@CrossOrigin(origins = "*")
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

    
    @PostMapping("/login")
    public TaiKhoan login(@RequestBody TaiKhoan tk) {
        return service.login(
            tk.getTenTaiKhoan(),
            tk.getMatKhau()
        );
    }
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TaiKhoan tk) {
        try {
            TaiKhoan created =
                service.register(tk);
            return ResponseEntity.ok(created);
        }
        catch (Exception e) {
            return ResponseEntity
                .badRequest()
                .body(e.getMessage());
        }
    }
}
