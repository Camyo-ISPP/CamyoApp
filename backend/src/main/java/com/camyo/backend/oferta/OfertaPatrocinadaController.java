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
    @PostMapping
    public ResponseEntity<?> patrocinarOferta(
            @RequestParam("ofertaId") Integer ofertaId,
            @RequestParam("dias") int dias
    ) {
        try {

            OfertaPatrocinada nuevoPatrocinio = ofertaPatrocinadaService.patrocinarOferta(ofertaId, dias);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPatrocinio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/desactivar/{ofertaId}")
    public ResponseEntity<?> desactivarPatrocinio(@PathVariable("ofertaId") Integer ofertaId) {
        try {
            ofertaPatrocinadaService.desactivarPatrocinio(ofertaId);
            return ResponseEntity.ok("Patrocinio desactivado con éxito.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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
