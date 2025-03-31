package com.camyo.backend.oferta;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class TrabajoService {
    
    @Autowired
    private TrabajoRepository trabajoRepository;


    @Transactional
    public Trabajo guardarTrabajo(Trabajo trabajo) {
        return trabajoRepository.save(trabajo);
    }

}
