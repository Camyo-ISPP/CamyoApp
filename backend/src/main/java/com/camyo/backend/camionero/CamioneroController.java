package com.camyo.backend.camionero;

import java.util.List;

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
import jakarta.validation.Valid;

@RestController
@RequestMapping("/camioneros")
@Tag(name = "Camioneros", description = "API para gestión de camioneros")
public class CamioneroController {

    @Autowired
    private CamioneroService camioneroService;

    @Autowired
    private UsuarioService usuarioService;

    @Operation(summary = "Obtener todos los camioneros", description = "Obtiene los detalles de todos los camioneros registrados en la BD.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Camioneros encontrados y devueltos")
    })
    @GetMapping
    public List<Camionero> obtenerTodosCamioneros() {
        return camioneroService.obtenerTodosCamioneros();
    }

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


     /*
    * Deprecated
  */ 

     @Operation(summary = "Guardar camionero", 
               description = "Almacena un camionero en la BD. Se crea con el usuario que ha iniciado sesión.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Camionero creado con éxito"),
        @ApiResponse(responseCode = "403", description = "El usuario debe iniciar sesión"),
        @ApiResponse(responseCode = "400", description = "El usuario ya tiene un camionero registrado"),
        @ApiResponse(responseCode = "500", description = "Error interno al guardar el camionero")
    })
    @PostMapping
    public ResponseEntity<?> guardarCamionero(@RequestBody @Valid Camionero camionero) {
        // 1. Verificar que el usuario está autenticado
        try {
            usuarioService.obtenerUsuarioActual();
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(
                new MessageResponse("Debe iniciar sesión para crear un camionero."), 
                HttpStatus.FORBIDDEN
            );
        }

        // 2. Comprobar si el usuario ya tiene un camionero
        try {
            Usuario usuario = usuarioService.obtenerUsuarioActual();
            camioneroService.obtenerCamioneroPorUsuario(usuario.getId());
            // Si no lanza excepción, significa que sí existe
            return new ResponseEntity<>(
                new MessageResponse("El usuario ya tiene un camionero registrado."), 
                HttpStatus.BAD_REQUEST
            );
        } catch (ResourceNotFoundException e) {
            // No se encontró camionero para este usuario, podemos continuar
        }

        // 3. Asignar el usuario autenticado al nuevo Camionero
        camionero.setUsuario(usuarioService.obtenerUsuarioActual());

        // 4. Guardar el nuevo Camionero
        try {
            Camionero camioneroGuardado = camioneroService.guardarCamionero(camionero);
            return new ResponseEntity<>(camioneroGuardado, HttpStatus.CREATED);
        } catch (DataAccessException ex) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * PUT /camioneros/{id}
     * Actualiza un Camionero existente, siempre que pertenezca al usuario autenticado.
     */
    @Operation(summary = "Actualizar camionero", 
               description = "Actualiza la información de un camionero existente, siempre que pertenezca al usuario autenticado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Camionero actualizado con éxito"),
        @ApiResponse(responseCode = "403", description = "El usuario debe iniciar sesión o no puede actualizar un camionero que no es suyo"),
        @ApiResponse(responseCode = "404", description = "No se encontró un camionero con ese ID"),
        @ApiResponse(responseCode = "500", description = "Error interno al actualizar el camionero")
    })
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCamionero(@PathVariable Integer id,
                                                 @RequestBody @Valid Camionero camionero) {
        // 1. Verificar que el usuario está autenticado
        try {
            usuarioService.obtenerUsuarioActual();
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(
                new MessageResponse("Debe iniciar sesión para actualizar un camionero."), 
                HttpStatus.FORBIDDEN
            );
        }

        // 2. Obtener el Camionero existente
        try {
            Camionero camioneroExistente = camioneroService.obtenerCamioneroPorId(id);
            // 3. Verificar que el Camionero pertenece al usuario autenticado
            if (!camioneroExistente.getUsuario().equals(usuarioService.obtenerUsuarioActual())) {
                return new ResponseEntity<>(
                    new MessageResponse("No puede actualizar un camionero que no es suyo."), 
                    HttpStatus.FORBIDDEN
                );
            }
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // 4. Actualizar el Camionero
        try {
            Camionero camioneroActualizado = camioneroService.actualizarCamionero(id, camionero);
            return new ResponseEntity<>(camioneroActualizado, HttpStatus.OK);
        } catch (DataAccessException ex) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Operation(summary = "Eliminar camionero", description = "Elimina un camionero existente, siempre que pertenezca al usuario autenticado.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Camionero eliminado con éxito"),
        @ApiResponse(responseCode = "403", description = "El usuario debe iniciar sesión o no puede eliminar un camionero que no es suyo"),
        @ApiResponse(responseCode = "404", description = "No se encontró un camionero con ese ID o No puede eliminar un camionero que no es suyo"),
        @ApiResponse(responseCode = "500", description = "Error interno al guardar el camionero")

    })
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCamionero(@PathVariable("id") Integer id) {
        // 1. Verificar que el usuario está autenticado
        Usuario usuario;
        try {
            usuario = usuarioService.obtenerUsuarioActual();
        } catch (ResourceNotFoundException e) {
            // Si el usuario no está autenticado o no existe, retornamos 403
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    
        try {
            // 2. Obtener el Camionero existente
            Camionero camioneroExistente = camioneroService.obtenerCamioneroPorId(id);
    
            // 3. Verificar que el Camionero pertenece al usuario autenticado
            if (!camioneroExistente.getUsuario().equals(usuario)) {
                // Si el Camionero no pertenece al usuario, retornamos 403 (Forbidden)
                return new ResponseEntity<>(
                    new MessageResponse("No puede eliminar un camionero que no es suyo."),
                    HttpStatus.METHOD_NOT_ALLOWED
                );
            }
    
            // 4. Eliminar el Camionero
            camioneroService.eliminarCamionero(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    
        } catch (ResourceNotFoundException e) {
            // Si no se encontró el Camionero, retornamos 404 (Not Found)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception ex) {
            // Para cualquier otro error inesperado, retornamos 500 (Internal Server Error)
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
