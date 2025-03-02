package com.camyo.backend.camionero;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface CamioneroRepository extends JpaRepository<Camionero, Integer>{
    @Query("SELECT DISTINCT c FROM Camionero c WHERE c.usuario.id = :usuarioId")
	public Optional<Camionero> obtenerCamioneroPorUsuario(int userId);
}
