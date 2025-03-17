package com.camyo.backend.usuario;


import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends CrudRepository<Usuario, Integer> {

    @Query("SELECT u FROM Usuario u WHERE u.email = :email")
    Optional<Usuario> findByEmail(String email);

    @Query("SELECT u FROM Usuario u WHERE u.username = :username")
    Optional<Usuario> findByUsername(String username);

    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.username = :username")
    Boolean existsByUsername(String username);

    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.email = :email")
    Boolean existsByEmail(String email);
  
    @Query("SELECT u.reseñas FROM Usuario u WHERE u.id = :userId")
    public List<Resena> obtenerReseñas(Integer userId);
}
