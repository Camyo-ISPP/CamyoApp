package com.camyo.backend.usuario;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.exceptions.InvalidPhoneNumberException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@Tag(name = "Usuarios", description = "API para gestión de usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AuthoritiesService authService;

    @Autowired
	public UsuarioController(UsuarioService usuarioService, AuthoritiesService authService) {
		this.usuarioService = usuarioService;
		this.authService = authService;
	}

    @GetMapping("/{id}/valoracion")
    public ResponseEntity<Float> obtenerValoracionMedia(@PathVariable Integer id) {
        Float valoracionMedia = usuarioService.obtenerValoracionMedia(id);
        return ResponseEntity.ok(valoracionMedia);
    }

    @Operation(summary = "Obtener todos los usuarios", description = "Obtiene la lista de todos los usuarios registrados.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuarios encontrados y devueltos")
    })
    @GetMapping
    public ResponseEntity<List<Usuario>> obtenerUsuarios() {
        List<Usuario> usuarios = usuarioService.obtenerUsuarios();
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @Operation(summary = "Obtener authorities", description = "Obtiene todas las autoridades disponibles.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Authorities encontradas y devueltas")
    })
    @GetMapping("/authorities")
	public ResponseEntity<List<Authorities>> obtenerAuthorities() {
		List<Authorities> res = (List<Authorities>) authService.findAll();
		return new ResponseEntity<>(res, HttpStatus.OK);
	}

    @Operation(summary = "Obtener usuario por ID", description = "Obtiene un usuario por su identificador único.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario encontrado y devuelto"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerUsuarioPorId(@PathVariable Integer id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        return new ResponseEntity<>(usuario, HttpStatus.OK);
    }

    @Operation(summary = "Obtener usuario por email", description = "Obtiene un usuario por su email.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario encontrado y devuelto"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/email")
	public ResponseEntity<Usuario> obtenerUsuarioPorEmail(@RequestParam("email") String email) {
		return new ResponseEntity<>(usuarioService.obtenerUsuarioPorEmail(email), HttpStatus.OK);
	}

    @Operation(summary = "Obtener usuario por nombre de usuario", description = "Obtiene un usuario por su nombre de usuario.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario encontrado y devuelto"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/username")
	public ResponseEntity<Usuario> obtenerUsuarioPorUsername(@RequestParam("username") String username) {
		return new ResponseEntity<>(usuarioService.obtenerUsuarioPorUsername(username), HttpStatus.OK);
	}

    @Operation(summary = "Crear usuario", description = "Registra un nuevo usuario en la base de datos.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Usuario creado con éxito")
    })
    @PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ResponseEntity<Usuario> create(@RequestBody @Valid Usuario user) {
		Usuario usuarioGuardado;
        try {
            usuarioGuardado = usuarioService.guardarUsuario(user);
        } catch (InvalidPhoneNumberException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		return new ResponseEntity<>(usuarioGuardado, HttpStatus.CREATED);
	}

    @Operation(summary = "Actualizar usuario", description = "Actualiza la información de un usuario existente.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario actualizado con éxito"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PutMapping(value = "/{id}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<Usuario> update(@PathVariable("id") Integer id, @RequestBody @Valid Usuario user) {
		Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        if (usuario != null) {
            try {
                Usuario usuarioActualizado = this.usuarioService.updateUser(user, id);
                return new ResponseEntity<>(usuarioActualizado, HttpStatus.OK);
            } catch (InvalidPhoneNumberException e) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
	}

    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario de la base de datos.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario eliminado con éxito"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
	@DeleteMapping(value = "/{id}")
	public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        if (usuario != null) {
            usuarioService.eliminarUsuario(id);
            return new ResponseEntity<>(new MessageResponse("Usuario eliminado con éxito!"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new MessageResponse("Usuario no encontrado."), HttpStatus.NOT_FOUND);
        }
    }

}
