package com.example.ticket.service;

import com.example.ticket.dto.request.VoucherRequest;
import com.example.ticket.dto.response.VoucherResponse;
import java.util.List;

public interface VoucherService {
    List<VoucherResponse> getByCreator(Long maTaiKhoan);
    VoucherResponse getById(Long id);
    VoucherResponse getByCode(String maCode);
    VoucherResponse create(VoucherRequest request);
    VoucherResponse update(Long id, VoucherRequest request);
    void delete(Long id);
}