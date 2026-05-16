package com.example.ticket.service;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;

import java.util.List;

public interface VeService {
    VeResponse create(VeRequest request);
    List<VeResponse> getAll();
    VeResponse getById(Long id);
    VeResponse update(Long id, VeRequest request);
    void delete(Long id);
}