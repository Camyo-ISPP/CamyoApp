package com.camyo.backend.resena;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.camyo.backend.usuario.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/resenas")
public class ResenaController {

    @Autowired
    private ResenaService resenaService;
    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/comentado/{userId}")
    public ResponseEntity<List<Resena>> obtenerTodasResenasComentado(@PathVariable Integer userId) {
        List<Resena> resenas = resenaService.obtenerTodasResenasComentadoPorId(userId);
        return new ResponseEntity<>(resenas, HttpStatus.OK);
    }

    @GetMapping("/comentador/{userId}")
    public ResponseEntity<List<Resena>> obtenerTodasResenasComentador(@PathVariable Integer userId) {
        List<Resena> resenas = resenaService.obtenerTodasResenasComentadorPorId(userId);
        return new ResponseEntity<>(resenas, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resena> obtenerResenaPorId(@PathVariable Integer id) {
        Resena resena = resenaService.obtenerResena(id);
        return new ResponseEntity<>(resena, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Resena> crearResena(@RequestBody Resena resena) {
        Resena nuevaResena = resenaService.crearResena(resena);
        return new ResponseEntity<>(nuevaResena, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarResena(@PathVariable Integer id, @RequestBody Resena resenaDetalles) {
        if (!usuarioService.obtenerUsuarioActual().getId().equals(resenaDetalles.getComentador().getId())) {
            return new ResponseEntity<>("No tienes permiso para actualizar esta reseña.", HttpStatus.FORBIDDEN);
        }
        Resena resenaActualizada = resenaService.actualizarResena(id, resenaDetalles);
        return new ResponseEntity<>(resenaActualizada, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarResena(@PathVariable Integer id) {
        if (!usuarioService.obtenerUsuarioActual().getId().equals(resenaService.obtenerResena(id).getComentador().getId())) {
            return new ResponseEntity<>("No tienes permiso para borrar esta reseña.", HttpStatus.FORBIDDEN);
        }
        resenaService.eliminarResena(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}