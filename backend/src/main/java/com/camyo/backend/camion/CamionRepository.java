package com.camyo.backend.camion;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface CamionRepository extends JpaRepository<Camion, Integer> {
    @Query("SELECT c.camiones FROM Camionero c WHERE c.id = :id")
    public List<Camion> obtenerCamionPorCamionero(Integer id);
}
