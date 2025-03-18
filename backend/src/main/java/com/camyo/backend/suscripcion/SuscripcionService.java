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
     * Asigna o actualiza la suscripción de una empresa.
     * - Si ya existe una suscripción, se modifica (nivel, fechaInicio, fechaFin, activa=true).
     * - Si no existe, se crea una nueva.
     * 
     * Reglas:
     * - Plan GRATIS => fechaFin = null.
     * - Plan BASIC/PREMIUM => si duracionDias == null, se pone 30 por defecto.
     */
    @Transactional
    public Suscripcion asignarSuscripcion(Integer empresaId, PlanNivel nivel, Integer duracionDias) {
        Empresa empresa = empresaService.obtenerEmpresaPorId(empresaId);

        // Buscar si la empresa ya tiene alguna suscripción (activa o no)
        Optional<Suscripcion> optionalSus = suscripcionRepository.findAnyByEmpresa(empresa);

        // Determinar fechaFin según plan
        LocalDate fechaFin = null;
        if (nivel == PlanNivel.GRATIS) {
            // Suscripción Gratis: Sin fecha fin
            fechaFin = null;
        } else {
            // BASIC o PREMIUM: si no se pasa duración => 30 días por defecto
            if (duracionDias == null) {
                duracionDias = 30;
            }
            fechaFin = LocalDate.now().plusDays(duracionDias);
        }

        if (optionalSus.isPresent()) {
            // Reutilizar la suscripción existente
            Suscripcion susExistente = optionalSus.get();
            susExistente.setNivel(nivel);
            susExistente.setFechaInicio(LocalDate.now());
            susExistente.setFechaFin(fechaFin);
            susExistente.setActiva(true);
            return suscripcionRepository.save(susExistente);
        } else {
            // Crear una nueva suscripción
            Suscripcion nueva = new Suscripcion();
            nueva.setEmpresa(empresa);
            nueva.setNivel(nivel);
            nueva.setFechaInicio(LocalDate.now());
            nueva.setFechaFin(fechaFin);
            nueva.setActiva(true);
            return suscripcionRepository.save(nueva);
        }
    }

    /**
     * Obtiene la suscripción activa de la empresa. 
     * Si la suscripción ha caducado (fechaFin < hoy), la marca como inactiva y lanza ResourceNotFoundException.
     */
    @Transactional(readOnly = true)
    public Suscripcion obtenerSuscripcionActiva(Integer empresaId) {
        Empresa empresa = empresaService.obtenerEmpresaPorId(empresaId);

        Suscripcion sus = suscripcionRepository.findByEmpresaAndActivaTrue(empresa)
            .orElseThrow(() -> new ResourceNotFoundException("Suscripcion", "empresaId", empresaId));

        // Verificar si ha caducado (fechaFin != null y hoy > fechaFin)
        if (sus.getFechaFin() != null && LocalDate.now().isAfter(sus.getFechaFin())) {
            sus.setActiva(false);
            suscripcionRepository.save(sus);
            throw new ResourceNotFoundException("Suscripcion", "caducada", empresaId);
        }

        return sus;
    }

    /**
     * Devuelve el nivel de la suscripción activa, o GRATIS si no hay suscripción activa.
     */
    @Transactional(readOnly = true)
    public PlanNivel obtenerNivelSuscripcion(Integer empresaId) {
        try {
            return obtenerSuscripcionActiva(empresaId).getNivel();
        } catch (ResourceNotFoundException e) {
            // Si no hay suscripción activa o caducó, se considera GRATIS
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
     * Guarda (o actualiza) una suscripción genérica (por ejemplo, para desactivarla manualmente).
     */
    @Transactional
    public Suscripcion guardar(Suscripcion suscripcion) {
        return suscripcionRepository.save(suscripcion);
    }
}
