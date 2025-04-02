package com.camyo.backend.oferta;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CargaService {
    
    @Autowired
    private CargaRepository cargaRepository;

    @Transactional
    public Carga guardarCarga(Carga carga) {
        return cargaRepository.save(carga);
    }

}
