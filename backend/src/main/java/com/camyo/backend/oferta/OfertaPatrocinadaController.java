package com.camyo.backend.oferta;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ofertas/patrocinadas")
public class OfertaPatrocinadaController {

    private final OfertaPatrocinadaService ofertaPatrocinadaService;

    public OfertaPatrocinadaController(OfertaPatrocinadaService ofertaPatrocinadaService) {
        this.ofertaPatrocinadaService = ofertaPatrocinadaService;
    }

    /**
     * Patrocinar Oferta
     * POST /ofertas/patrocinadas?ofertaId=123&dias=30
     * Ya no pedimos empresaId, porque se extrae del token
     */
    @PostMapping
    public ResponseEntity<?> patrocinarOferta(
            @RequestParam("ofertaId") Integer ofertaId,
            @RequestParam("dias") int dias
    ) {
        try {
            // La empresa se obtiene internamente del token
            OfertaPatrocinada nuevoPatrocinio = ofertaPatrocinadaService.patrocinarOferta(ofertaId, dias);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPatrocinio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Desactivar Patrocinio
     * PUT /ofertas/patrocinadas/desactivar/123
     */
    @PutMapping("/desactivar/{ofertaId}")
    public ResponseEntity<?> desactivarPatrocinio(@PathVariable("ofertaId") Integer ofertaId) {
        try {
            ofertaPatrocinadaService.desactivarPatrocinio(ofertaId);
            return ResponseEntity.ok("Patrocinio desactivado con éxito.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET /ofertas/patrocinadas/activos/empresa/226
    @GetMapping("/activos/empresa/{empresaId}")
    public ResponseEntity<?> listarPatrociniosActivosDeEmpresa(@PathVariable("empresaId") Integer empresaId) {
        try {
            List<OfertaPatrocinada> lista =
                ofertaPatrocinadaService.listarPatrociniosActivosDeEmpresa(empresaId);
            return ResponseEntity.ok(lista);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /ofertas/patrocinadas/expirar
    @PutMapping("/expirar")
    public ResponseEntity<?> expirarPatrocinios() {
        try {
            ofertaPatrocinadaService.expirarPatrocinios();
            return ResponseEntity.ok("Patrocinios expirados exitosamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
