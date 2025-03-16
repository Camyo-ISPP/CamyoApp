package com.camyo.backend.suscripcion;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.empresa.Empresa;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/suscripciones")
@CrossOrigin(origins = "http://localhost:8081")
@Tag(name = "Suscripciones", description = "API para gestión de planes de suscripción (Gratis, Basic, Premium)")
public class SuscripcionController {

    @Autowired
    private SuscripcionService suscripcionService;

    /**
     * GET /suscripciones/activa/{empresaId}
     * Obtiene la suscripción activa de una empresa.
     */
    @Operation(summary = "Obtener suscripción activa por ID de empresa",
               description = "Devuelve la suscripción activa asociada a la empresa, si existe.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Suscripción encontrada y devuelta"),
        @ApiResponse(responseCode = "404", description = "No se encontró una suscripción activa para la empresa")
    })
    @GetMapping("/activa/{empresaId}")
    public ResponseEntity<Suscripcion> obtenerSuscripcionActiva(@PathVariable Integer empresaId) {
        try {
            Suscripcion suscripcion = suscripcionService.obtenerSuscripcionActiva(empresaId);
            return new ResponseEntity<>(suscripcion, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /suscripciones/{empresaId}?nivel=PREMIUM&duracion=30
     * Asigna o actualiza una suscripción a la empresa (por ejemplo, Plan PREMIUM durante 30 días).
     */
    @Operation(summary = "Asignar o cambiar suscripción de una empresa",
               description = "Establece el plan (GRATIS, BASIC, PREMIUM) y la duración de la suscripción.")
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
     * Consulta el nivel de suscripción de la empresa (GRATIS, BASIC, PREMIUM).
     */
    @Operation(summary = "Consultar nivel de suscripción de una empresa",
               description = "Retorna si la empresa está en plan GRATIS, BASIC o PREMIUM.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Nivel de suscripción encontrado y devuelto"),
        @ApiResponse(responseCode = "404", description = "Empresa no encontrada (o sin suscripción activa)")
    })
    @GetMapping("/nivel/{empresaId}")
    public ResponseEntity<PlanNivel> obtenerNivelSuscripcion(@PathVariable Integer empresaId) {
        try {
            PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(empresaId);
            return new ResponseEntity<>(nivel, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * PUT /suscripciones/desactivar/{id}
     * Desactiva manualmente una suscripción (ej. si quieres una opción de cancelar sin crear otra).
     */
    @Operation(summary = "Desactivar una suscripción",
               description = "Cambia el estado 'activa' de la suscripción a false.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Suscripción desactivada con éxito"),
        @ApiResponse(responseCode = "404", description = "Suscripción no encontrada")
    })
    @PutMapping("/desactivar/{id}")
    public ResponseEntity<MessageResponse> desactivarSuscripcion(@PathVariable("id") Integer suscripcionId) {
        Optional<Suscripcion> optionalSus = suscripcionService.buscarPorId(suscripcionId);
        if (optionalSus.isPresent()) {
            Suscripcion sus = optionalSus.get();
            sus.setActiva(false);
            suscripcionService.guardar(sus);  // método que persiste la suscripción
            return new ResponseEntity<>(new MessageResponse("Suscripción desactivada con éxito."), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new MessageResponse("Suscripción no encontrada."), HttpStatus.NOT_FOUND);
        }
    }
}
