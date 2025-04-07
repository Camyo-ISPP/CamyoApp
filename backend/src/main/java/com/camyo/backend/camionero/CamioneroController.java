package com.camyo.backend.camionero;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.camyo.backend.exceptions.ResourceNotFoundException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/camioneros")
@Tag(name = "Camioneros", description = "API para gestión de camioneros")
public class CamioneroController {

    @Autowired
    private CamioneroService camioneroService;

    @Operation(summary = "Obtener camionero por ID", description = "Obtiene los detalles de un camionero por su ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Camionero encontrado y devuelto"),
        @ApiResponse(responseCode = "404", description = "No se encontró un camionero con ese ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Camionero> obtenerCamioneroPorId(@PathVariable Integer id) {
        try {
            Camionero camionero = camioneroService.obtenerCamioneroPorId(id);
            return new ResponseEntity<>(camionero, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Obtener camionero por usuario", description = "Obtiene los detalles de un camionero a partir del ID del usuario que lo posee.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Camionero encontrado y devuelto"),
        @ApiResponse(responseCode = "404", description = "No se encontró un camionero para ese usuario")
    })
    @GetMapping("/por_usuario/{id}")
    public ResponseEntity<Camionero> obtenerCamioneroPorUsuario(@PathVariable Integer id) {
        try {
            Camionero camionero = camioneroService.obtenerCamioneroPorUsuario(id);
            return new ResponseEntity<>(camionero, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
