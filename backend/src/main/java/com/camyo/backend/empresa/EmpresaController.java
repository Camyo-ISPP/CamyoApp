package com.camyo.backend.empresa;

import java.util.List;
import java.util.Optional;

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
@RequestMapping("/empresas")
@Tag(name = "Empresas", description = "API para gestión de empresas")
public class EmpresaController {
    
    @Autowired
    private EmpresaService empresaService;

    @Operation(summary = "Obtener todas las empresas", description = "Obtiene los detalles de todas las empresas que se encuentran en la BD.")
    @ApiResponses({
       @ApiResponse(responseCode = "200", description = "Empresas encontradas y devueltas")
    })
    @GetMapping
    public List<Empresa> obtenerTodasEmpresas() {
        return empresaService.obtenerTodasEmpresas();
    }

    @Operation(summary = "Obtener empresa por ID", description = "Obtiene los detalles de una empresa por su ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Empresa encontrada y devuelta"),
        @ApiResponse(responseCode = "404", description = "No se encontró una empresa con ese ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Empresa> obtenerEmpresaPorId(@PathVariable Integer id) {
        try {
            Empresa empresa = empresaService.obtenerEmpresaPorId(id);
            return new ResponseEntity<>(empresa, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @Operation(summary = "Obtener empresa por usuario", description = "Obtiene los detalles de una empresa por el usuario que la posee.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Empresas encontrada y devuelta"),
        @ApiResponse(responseCode = "404", description = "No se encontró una empresa con ese usuario")
    })
    @GetMapping("/por_usuario/{id}")
    public ResponseEntity<Empresa> obtenerEmpresaPorUsuario(@PathVariable Integer id) {
        Optional<Empresa> empresa = empresaService.obtenerEmpresaPorUsuario(id);
        return empresa.isPresent() ? new ResponseEntity<>(empresa.get(), HttpStatus.OK) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

}
