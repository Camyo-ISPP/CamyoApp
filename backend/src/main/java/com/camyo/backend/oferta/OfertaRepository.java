package com.camyo.backend.oferta;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta,Integer>{

    List<Oferta> findAll();

    Optional<Oferta> findById(Integer id);

    @Query("Select c FROM Carga c WHERE c.oferta.id= :id")
    Carga encontrarCargaPorOferta(Integer id);

    @Query("Select t FROM Trabajo t WHERE t.oferta.id= :id")
    Trabajo encontrarTrabajoPorOferta(Integer id);

    @Query("Select o FROM Oferta o JOIN o.aplicados c WHERE c.id= :camId")
    List<Oferta> encontrarAplicadas(Integer camId);

    @Query("Select o FROM Oferta o JOIN o.rechazados c WHERE c.id= :camId")
    List<Oferta> encontrarRechazadas(Integer camId);

    @Query("Select c.asignadas FROM Camionero c WHERE c.id= :camId")
    List<Oferta> encontrarAsignadas(Integer camId);

    @Query("SELECT o FROM Oferta o JOIN o.aplicados c WHERE c.id = :camId ORDER BY o.fechaPublicacion DESC")
    List<Oferta> encontrarAplicadasOrdenadas(Integer camId);

    @Query("SELECT o FROM Oferta o JOIN o.aplicados c WHERE c.id = :camId AND o.estado = :estado ORDER BY o.fechaPublicacion DESC")
    List<Oferta> encontrarAplicadasPorEstado(Integer camId, OfertaEstado estado);

    @Query("SELECT o FROM Oferta o WHERE empresa.id = :empId ORDER BY o.fechaPublicacion DESC")
    List<Oferta> encontrarOfertasPorEmpresa(Integer empId);

    @Query("SELECT o FROM Oferta o WHERE o.estado = 'ABIERTA' ORDER BY o.promoted DESC, o.fechaPublicacion DESC LIMIT 10")
    List<Oferta> findTopByOrderByFechaPublicacionDesc();

    @Query("SELECT COUNT(o) FROM Oferta o WHERE o.estado = 'ABIERTA' AND o.promoted = true AND o.empresa.id = :empresaId")
    Integer countByEmpresaIdPromotedTrue(Integer empresaId);


}
