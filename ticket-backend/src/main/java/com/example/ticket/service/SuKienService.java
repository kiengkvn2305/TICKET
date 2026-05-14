package com.example.ticket.service;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;

import java.util.List;

public interface SuKienService {

    List<SuKienResponse> getAll();
    
    SuKienResponse getById(Long id);
    
    SuKienResponse create(SuKienRequest request);
    
    SuKienResponse update(Long id, SuKienRequest request);
    
    void delete(Long id);
    
    List<SuKienResponse> getByCreator(Long maTaiKhoan);
}