package com.camyo.backend.suscripcion;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.exceptions.ResourceNotFoundException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/suscripciones")
@Tag(name = "Suscripciones", description = "API para gestión de planes de suscripción (Gratis, Basic, Premium)")
public class SuscripcionController {

    @Autowired
    private SuscripcionService suscripcionService;

    /**
     * GET /suscripciones/activa/{empresaId}
     */
    @Operation(summary = "Obtener suscripción activa por ID de empresa",
               description = "Devuelve la suscripción activa asociada a la empresa, si existe y no ha caducado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Suscripción activa encontrada y devuelta"),
        @ApiResponse(responseCode = "404", description = "No se encontró una suscripción activa (caducó o no existe)")
    })
    @GetMapping("/activa/{empresaId}")
    public ResponseEntity<Suscripcion> obtenerSuscripcionActiva(@PathVariable Integer empresaId) {
        try {
            Suscripcion suscripcion = suscripcionService.obtenerSuscripcionActiva(empresaId);
            return ResponseEntity.ok(suscripcion);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST /suscripciones/{empresaId}?nivel=PREMIUM&duracion=30
     */
    @Operation(summary = "Asignar o cambiar suscripción de una empresa",
               description = "Establece el plan (GRATIS, BASIC, PREMIUM) y la duración (días). Por defecto 30 si es BASIC/PREMIUM y no se pasa.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Suscripción asignada o modificada con éxito"),
        @ApiResponse(responseCode = "404", description = "Empresa no encontrada")
    })
    @PostMapping("/{empresaId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Suscripcion> asignarSuscripcion(
            @PathVariable Integer empresaId,
            @RequestParam("nivel") PlanNivel nivel,
            @RequestParam(value = "duracion", required = false) Integer duracionDias) {

        try {
            Suscripcion suscripcionNueva = suscripcionService.asignarSuscripcion(empresaId, nivel, duracionDias);
            return new ResponseEntity<>(suscripcionNueva, HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * GET /suscripciones/nivel/{empresaId}
     */
    @Operation(summary = "Consultar nivel de suscripción de una empresa",
               description = "Retorna si la empresa está en plan GRATIS, BASIC o PREMIUM (mira la suscripción activa).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Nivel encontrado y devuelto"),
        @ApiResponse(responseCode = "404", description = "Empresa no encontrada o sin suscripción activa")
    })
    @GetMapping("/nivel/{empresaId}")
    public ResponseEntity<PlanNivel> obtenerNivelSuscripcion(@PathVariable Integer empresaId) {
        try {
            PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(empresaId);
            return ResponseEntity.ok(nivel);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * PUT /suscripciones/desactivar/{id}
     * Desactiva manualmente la suscripción
     */
    @Operation(summary = "Desactivar una suscripción",
               description = "Establece activa=false para la suscripción con ID dado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Suscripción desactivada con éxito"),
        @ApiResponse(responseCode = "404", description = "No se encontró la suscripción")
    })
    @PutMapping("/desactivar/{id}")
    public ResponseEntity<MessageResponse> desactivarSuscripcion(@PathVariable("id") Integer suscripcionId) {
        Optional<Suscripcion> optionalSus = suscripcionService.buscarPorId(suscripcionId);
        if (optionalSus.isPresent()) {
            Suscripcion sus = optionalSus.get();
            sus.setActiva(false);
            suscripcionService.guardar(sus);
            return ResponseEntity.ok(new MessageResponse("Suscripción desactivada con éxito."));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Suscripción no encontrada."));
        }
    }
}
