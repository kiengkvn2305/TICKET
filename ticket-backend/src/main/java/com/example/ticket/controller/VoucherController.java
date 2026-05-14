package com.example.ticket.controller;

import com.example.ticket.model.Voucher;
import com.example.ticket.service.VoucherService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/voucher")
@CrossOrigin(origins = "*")

public class VoucherController {
    
    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping("/creator/{maTaiKhoan}")
    public List<Voucher> getByCreator(@PathVariable Long maTaiKhoan) {
        return voucherService.getByCreator(maTaiKhoan);
    }

}