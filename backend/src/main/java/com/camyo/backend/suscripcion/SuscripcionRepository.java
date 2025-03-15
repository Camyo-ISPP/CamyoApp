package com.camyo.backend.suscripcion;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.camyo.backend.empresa.Empresa;



public interface SuscripcionRepository  extends  CrudRepository<Suscripcion, Integer>{
/**
     * Ejemplo de método que obtiene todas las suscripciones activas
     * de un plan específico (GRATIS, BASIC, PREMIUM).
     */
    @Query("SELECT s FROM Suscripcion s WHERE s.nivel = :nivel AND s.activa = true")
    List<Suscripcion> findActiveByNivel(@Param("nivel") PlanNivel nivel);

    /**
     * Ejemplo de método que busca una suscripción activa por empresa
     * (similar a findByEmpresaAndActivaTrue, pero con @Query manual).
     */
    @Query("SELECT s FROM Suscripcion s WHERE s.empresa.id = :empresaId AND s.activa = true")
    Optional<Suscripcion> findActiveSubscriptionByEmpresa(@Param("empresaId") Integer empresaId);
    
    @Query("SELECT s FROM Suscripcion s WHERE s.empresa = :empresa AND s.activa = true")
    public Optional<Suscripcion> findByEmpresaAndActivaTrue(Empresa empresa);
}
