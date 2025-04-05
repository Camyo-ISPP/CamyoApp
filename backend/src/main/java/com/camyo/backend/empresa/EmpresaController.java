package com.camyo.backend.empresa;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

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

    @Autowired
    private UsuarioService usuarioService;

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

     /*
    * Deprecated
  */ 
    @Operation(summary = "Guardar empresa", description = "Almacena una empresa en la BD.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Empresa creada con éxito"),
        @ApiResponse(responseCode = "403", description = "El usuario debe iniciar sesión"),
        @ApiResponse(responseCode = "400", description = "El usuario ya tiene una empresa"),
        @ApiResponse(responseCode = "500", description = "Error en la validación")
    })
    @PostMapping
    public ResponseEntity<Object> guardarEmpresa(@RequestBody Empresa empresa) {
        // La empresa se creará con el usuario que ha iniciado sesión.
        // Si no hay un usuario autenticado, no se permitirá guardar una empresa.
        try {
            Usuario usuario = usuarioService.obtenerUsuarioActual();
            empresa.setUsuario(usuario);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(new MessageResponse("Debe iniciar sesión para crear una empresa."), HttpStatus.FORBIDDEN);
        }
        
        // El usuario solo puede tener una empresa.
        Optional<Empresa> empresaUsuario = empresaService.obtenerEmpresaPorUsuario(empresa.getUsuario().getId());
        if (empresaUsuario.isPresent()) {
            return new ResponseEntity<>(new MessageResponse("El usuario ya tiene una empresa."), HttpStatus.BAD_REQUEST);
        }

        try {
            Empresa empresaGuardada = empresaService.guardarEmpresa(empresa);
            return new ResponseEntity<>(empresaGuardada, HttpStatus.CREATED);
        } catch (DataAccessException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Actualizar empresa", description = "Actualiza la información de una empresa ya existente y que pertenece al usuario autenticado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Empresa actualizada con éxito"),
        @ApiResponse(responseCode = "403", description = "El usuario debe iniciar sesión"),
        @ApiResponse(responseCode = "404", description = "No se encontró una empresa con ese ID")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Object> actualizarEmpresa(@RequestBody Empresa empresa, @PathVariable Integer id) {
        try {
            Usuario usuario = usuarioService.obtenerUsuarioActual();
            try {
                Empresa empresaParaActualizar = empresaService.obtenerEmpresaPorId(id);
                if (!empresaParaActualizar.getUsuario().equals(usuario)) {
                    return new ResponseEntity<>(new MessageResponse("No puede actualizar una empresa que no es suya."), HttpStatus.FORBIDDEN);
                }     
                empresa.setUsuario(usuario);
            } catch (ResourceNotFoundException e) {
                return new ResponseEntity<>(new MessageResponse("No se ha encontrado la empresa indicada"), HttpStatus.NOT_FOUND);

            }
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(new MessageResponse("Debe iniciar sesión para actualizar una empresa."), HttpStatus.FORBIDDEN);
        }

        try {
            Empresa empresaActualizada = empresaService.actualizarEmpresa(empresa, id);
            return new ResponseEntity<>(empresaActualizada, HttpStatus.OK);
        } catch (DataAccessException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(summary = "Eliminar empresa", description = "Elimina una empresa ya existente y que pertenece al usuario autenticado.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Empresa eliminada con éxito"),
        @ApiResponse(responseCode = "403", description = "El usuario debe iniciar sesión"),
        @ApiResponse(responseCode = "404", description = "No se encontró una empresa con ese ID")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> eliminarEmpresa(@PathVariable Integer id) {
        try {
            Usuario usuario = usuarioService.obtenerUsuarioActual();
            try {
                Empresa empresaParaEliminar = empresaService.obtenerEmpresaPorId(id);
                if (!empresaParaEliminar.getUsuario().equals(usuario)) {
                    return new ResponseEntity<>(new MessageResponse("No puede eliminar una empresa que no es suya."), HttpStatus.FORBIDDEN);
                }
            } catch (ResourceNotFoundException e) {
                return new ResponseEntity<>(new MessageResponse("No se ha encontrado la empresa indicada"), HttpStatus.NOT_FOUND);

            }     
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(new MessageResponse("Debe iniciar sesión para eliminar una empresa."), HttpStatus.FORBIDDEN);
        }

        try {
            empresaService.eliminarEmpresa(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (DataAccessException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
