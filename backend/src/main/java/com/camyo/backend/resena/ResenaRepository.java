package com.camyo.backend.resena;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResenaRepository extends  CrudRepository<Resena, Integer>{

	@Query("SELECT r FROM Resena r WHERE r.comentado.id = :userId")
	public List<Resena> findAllComentadoByUserId(Integer userId);

	@Query("SELECT r FROM Resena r WHERE r.comentador.id = :userId")
	public List<Resena> findAllComentadorByUserId(Integer userId);
	
}