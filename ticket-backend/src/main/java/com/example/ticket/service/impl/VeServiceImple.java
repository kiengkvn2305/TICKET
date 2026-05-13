package com.example.ticket.service.impl;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.VeRepository;
import com.example.ticket.service.VeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VeServiceImple implements VeService{

    @Autowired
    private VeRepository veRepository;

    @Override
    public List<Ve> getAll() {

        return veRepository.findAll();

    }

}