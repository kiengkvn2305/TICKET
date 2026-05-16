package com.example.ticket.service;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;

import java.util.List;

public interface VeService {
    List<VeResponse> getAll();
    VeResponse getById(Long id);
    List<VeResponse> getBySuKien(Long maSuKien);
    // BUG FIX: thiếu method này → ticketList.js load vé của TẤT CẢ creator
    List<VeResponse> getByCreator(Long maTaiKhoan);
    VeResponse create(VeRequest request);
    VeResponse update(Long id, VeRequest request);
    void delete(Long id);
}