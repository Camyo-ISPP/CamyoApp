package com.camyo.backend.oferta;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OfertaPatrocinadaRepository extends JpaRepository<OfertaPatrocinada, Integer> {

    @Query("SELECT p FROM OfertaPatrocinada p " +
           "WHERE p.empresa.id = :empresaId " +
           "AND p.status = 'ACTIVO'")
    List<OfertaPatrocinada> findByEmpresaActivos(Integer empresaId);

    @Query("SELECT COUNT(p) FROM OfertaPatrocinada p " +
           "WHERE p.empresa.id = :empresaId " +
           "AND p.status = 'ACTIVO'")
    long countActiveByEmpresa(Integer empresaId);
    @Query("SELECT p FROM OfertaPatrocinada p " +
           "WHERE p.oferta.id = :ofertaId " +
           "AND p.status = 'ACTIVO'")
    Optional<OfertaPatrocinada> findActiveByOferta(Integer ofertaId);

    @Query("SELECT p FROM OfertaPatrocinada p " +
           "WHERE p.status = 'ACTIVO' " +
           "AND p.fechaFin < :ahora")
    List<OfertaPatrocinada> findExpiredButActive(LocalDateTime ahora);
}
