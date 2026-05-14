package com.example.ticket.service;

import com.example.ticket.model.Voucher;
import java.util.List;

public interface VoucherService {
    List<Voucher> getByCreator(Long maTaiKhoan);

}