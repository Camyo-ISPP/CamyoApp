package com.camyo.backend.resena;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaEstado;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/resenas")
public class ResenaController {

    @Autowired
    private ResenaService resenaService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private OfertaService ofertaService;

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
    public ResponseEntity<?> crearResena(@RequestBody Resena resena) {
        boolean isValid = false;
    
        if (usuarioService.obtenerUsuarioActual().hasAuthority("CAMIONERO")) {
            List<List<Oferta>> ofertasPorCamioneroComentador = ofertaService.obtenerOfertasPorCamionero(
                usuarioService.obtenerCamioneroIdPorUsuarioId(resena.getComentador().getId()));

            List<Oferta> listaDeOfertasAceptadasComentador = ofertasPorCamioneroComentador.size() > 2 
                    ? ofertasPorCamioneroComentador.get(2) 
                    : Collections.emptyList();

            List<Oferta> listaDeOfertasEmpresaComentado = ofertaService.obtenerOfertasPorEmpresa(
                usuarioService.obtenerEmpresaIdPorUsuarioId(resena.getComentado().getId()));

            isValid = listaDeOfertasAceptadasComentador.stream()
                    .anyMatch(oferta -> oferta.getEmpresa().getUsuario().getId().equals(resena.getComentado().getId())) &&
                    listaDeOfertasEmpresaComentado.stream()
                    .filter(oferta -> oferta.getEstado().equals(OfertaEstado.CERRADA) && oferta.getCamionero() != null)
                    .anyMatch(oferta -> oferta.getCamionero().getUsuario().getId().equals(resena.getComentador().getId()));
        } 
        
        else if (usuarioService.obtenerUsuarioActual().hasAuthority("EMPRESA")) {
            List<List<Oferta>> ofertasPorCamioneroComentado = ofertaService.obtenerOfertasPorCamionero(
                usuarioService.obtenerCamioneroIdPorUsuarioId(resena.getComentado().getId()));

            List<Oferta> listaDeOfertasAceptadasComentado = ofertasPorCamioneroComentado.size() > 2 
                    ? ofertasPorCamioneroComentado.get(2) 
                    : Collections.emptyList();

            List<Oferta> listaDeOfertasEmpresaComentador = ofertaService.obtenerOfertasPorEmpresa(
                usuarioService.obtenerEmpresaIdPorUsuarioId(resena.getComentador().getId()));

            isValid = listaDeOfertasAceptadasComentado.stream()
                    .anyMatch(oferta -> oferta.getEmpresa().getUsuario().getId().equals(resena.getComentador().getId())) &&
                    listaDeOfertasEmpresaComentador.stream()
                    .filter(oferta -> oferta.getEstado().equals(OfertaEstado.CERRADA) && oferta.getCamionero() != null)
                    .anyMatch(oferta -> oferta.getCamionero().getUsuario().getId().equals(resena.getComentado().getId()));
        }
    
        if (!isValid) {
            return new ResponseEntity<>("No se encontró oferta común entre la empresa y el camionero.", HttpStatus.BAD_REQUEST);
        }

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

    @GetMapping("/resenados/{userId}")
    public ResponseEntity<?> obtenerUsuariosReseñadosPorUsuario(@PathVariable Integer userId) {
        List<Resena> resenasDondeComentador = resenaService.obtenerTodasResenasComentadorPorId(userId);
        List<Usuario> resenas = resenasDondeComentador.stream()
                .map(resena -> resena.getComentado())
                .collect(Collectors.toList());
        return new ResponseEntity<>(resenas, HttpStatus.OK);
    }

}