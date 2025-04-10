package com.camyo.backend.usuario;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/usuarios")
@Tag(name = "Usuarios", description = "API para gestión de usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private EmpresaService empresaService;

    @Autowired
    private CamioneroService camioneroService;

    @Autowired
    private OfertaService ofertaService;

    @Autowired
	public UsuarioController(UsuarioService usuarioService, EmpresaService empresaService, CamioneroService camioneroService, OfertaService ofertaService) {
		this.usuarioService = usuarioService;
        this.empresaService = empresaService;
        this.camioneroService = camioneroService;
        this.ofertaService = ofertaService;
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

    @GetMapping("/{id}/valoracion")
    public ResponseEntity<Float> obtenerValoracionMedia(@PathVariable Integer id) {
        Float valoracionMedia = usuarioService.obtenerValoracionMedia(id);
        return ResponseEntity.ok(valoracionMedia);
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

    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario de la base de datos.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario eliminado con éxito"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
	@DeleteMapping(value = "/{id}")
	public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        Usuario usuarioActual = null;
		try {
			usuarioActual = usuarioService.obtenerUsuarioActual();
		} catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(
                new MessageResponse("Debe iniciar sesión para eliminar un usuario."), 
                HttpStatus.FORBIDDEN
            );
        }
        
        Usuario usuario = usuarioService.obtenerUsuarioPorId(id);
        if (usuario != null) {
            if(!usuarioActual.getAuthority().getAuthority().equals("ADMIN") && !usuarioActual.getId().equals(usuario.getId())){
                return new ResponseEntity<>(
                    new MessageResponse("Sólo un administrador puede eliminar cuentas ajenas."), 
                    HttpStatus.FORBIDDEN
                );
            }

            if (usuario.getAuthority().getAuthority().equals("EMPRESA")){
                Empresa empresa = empresaService.obtenerEmpresaPorUsuario(usuario.getId()).get();
                empresaService.eliminarEmpresa(empresa.getId());
            } else if (usuario.getAuthority().getAuthority().equals("CAMIONERO")){
                Camionero camionero = camioneroService.obtenerCamioneroPorUsuario(usuario.getId());
                List<List<Oferta>> ofertasCam = ofertaService.obtenerOfertasPorCamionero(camionero.getId());
                camioneroService.eliminarCamioneroDeOfertas(camionero, ofertasCam.get(0),ofertasCam.get(1));
                camioneroService.eliminarCamionero(camionero.getId());
            }
            usuarioService.eliminarUsuario(id);
            return new ResponseEntity<>(new MessageResponse("Usuario eliminado con éxito!"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new MessageResponse("Usuario no encontrado."), HttpStatus.NOT_FOUND);
        }
    }

}
