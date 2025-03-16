package com.camyo.backend.suscripcion;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;

@Service
public class SuscripcionService {
 
    private final SuscripcionRepository suscripcionRepository;
    private final EmpresaService empresaService;

    public SuscripcionService(SuscripcionRepository suscripcionRepository,
                              EmpresaService empresaService) {
        this.suscripcionRepository = suscripcionRepository;
        this.empresaService = empresaService;
    }

    /**
     * Asigna (o cambia) la suscripción de una empresa.
     *
     * @param empresaId    ID de la empresa
     * @param nivel        PlanNivel (GRATIS, BASIC, PREMIUM)
     * @param duracionDias Cuántos días dura el plan (null si Gratis)
     */
    @Transactional
    public Suscripcion asignarSuscripcion(Integer empresaId, PlanNivel nivel, Integer duracionDias) {
        Empresa empresa = empresaService.obtenerEmpresaPorId(empresaId);
        Optional<Suscripcion> optionalSus = suscripcionRepository.findAnyByEmpresa(empresa);
    
        if (optionalSus.isPresent()) {
            Suscripcion susExistente = optionalSus.get();
            susExistente.setNivel(nivel);
            susExistente.setFechaFin(duracionDias != null ? LocalDate.now().plusDays(duracionDias) : null);
            susExistente.setFechaInicio(LocalDate.now()); 
            susExistente.setActiva(true);
            return suscripcionRepository.save(susExistente); 
        }
        Suscripcion nueva = new Suscripcion();
        nueva.setEmpresa(empresa);
        nueva.setNivel(nivel);
        nueva.setFechaInicio(LocalDate.now());
        nueva.setActiva(true);
        if (duracionDias != null) {
            nueva.setFechaFin(LocalDate.now().plusDays(duracionDias));
        }
    
        return suscripcionRepository.save(nueva);
    }
    
    
    
    /**
     * Obtiene la suscripción activa de la empresa.
     */
    @Transactional(readOnly = true)
    public Suscripcion obtenerSuscripcionActiva(Integer empresaId) {
        Empresa empresa = empresaService.obtenerEmpresaPorId(empresaId);
        return suscripcionRepository.findByEmpresaAndActivaTrue(empresa)
            .orElseThrow(() -> new ResourceNotFoundException("Suscripcion", "empresaId", empresaId));
    }

    /**
     * Devuelve el nivel (GRATIS, BASIC, PREMIUM) de la suscripción activa.
     * Si no existe una suscripción, asumimos GRATIS (o lanza excepción).
     */
    @Transactional(readOnly = true)
    public PlanNivel obtenerNivelSuscripcion(Integer empresaId) {
        try {
            return obtenerSuscripcionActiva(empresaId).getNivel();
        } catch (ResourceNotFoundException e) {
            // Si la empresa no tiene suscripción activa, consideramos GRATIS
            return PlanNivel.GRATIS;
        }
    }

    /**
     * Busca una Suscripcion por su ID (opcional).
     */
    @Transactional(readOnly = true)
    public Optional<Suscripcion> buscarPorId(Integer suscripcionId) {
        return suscripcionRepository.findById(suscripcionId);
    }

    /**
     * Guarda (o actualiza) una suscripción genérica.
     */
    @Transactional
    public Suscripcion guardar(Suscripcion suscripcion) {
        return suscripcionRepository.save(suscripcion);
    }
}
