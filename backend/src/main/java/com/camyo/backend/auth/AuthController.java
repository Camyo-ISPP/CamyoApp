package com.camyo.backend.auth;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.camyo.backend.auth.payload.request.EditRequestCamionero;
import com.camyo.backend.auth.payload.request.EditRequestEmpresa;
import com.camyo.backend.auth.payload.request.LoginRequest;
import com.camyo.backend.auth.payload.request.SignupRequestCamionero;
import com.camyo.backend.auth.payload.request.SignupRequestEmpresa;
import com.camyo.backend.auth.payload.response.JwtResponse;
import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.configuration.jwt.JwtUtils;
import com.camyo.backend.configuration.services.UserDetailsImpl;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.InvalidNifException;
import com.camyo.backend.exceptions.InvalidPhoneNumberException;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticación", description = "API de autenticación")
public class AuthController {
	private final AuthenticationManager authenticationManager;
	private final UsuarioService usuarioService;
	private final JwtUtils jwtUtils;
	private final AuthService authService;
	private final CamioneroService camioneroService;
	private final EmpresaService empresaService;

	@Autowired
	public AuthController(AuthenticationManager authenticationManager, UsuarioService usuarioService, JwtUtils jwtUtils,
			AuthService authService, EmpresaService empresaService, CamioneroService camioneroService) {
		this.usuarioService = usuarioService;
		this.jwtUtils = jwtUtils;
		this.authenticationManager = authenticationManager;
		this.authService = authService;
		this.empresaService = empresaService;
		this.camioneroService = camioneroService;
	}

	@Operation(summary = "Iniciar sesión", description = "Autentica a un usuario y devuelve un token JWT.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Autenticación exitosa"),
        @ApiResponse(responseCode = "401", description = "Credenciales incorrectas")
    })
	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
		try {
			if (!usuarioService.existeUsuarioPorUsername(loginRequest.getUsername())) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body("El usuario '" + loginRequest.getUsername() + "' no está registrado.");
			}

			Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

			SecurityContextHolder.getContext().setAuthentication(authentication);
			String jwt = jwtUtils.generateJwtToken(authentication);

			UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
			List<String> roles = userDetails.getAuthorities().stream()
				.map(item -> item.getAuthority())
				.collect(Collectors.toList());

			return ResponseEntity.ok().body(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), roles));
		} catch (BadCredentialsException exception) {
			return new ResponseEntity<>("Credenciales incorrectas!", HttpStatus.UNAUTHORIZED);
		}
	}

	@Operation(summary = "Validar token JWT", description = "Verifica si un token JWT es válido.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Token válido o inválido")
	})
	@GetMapping("/validate")
	public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
		Boolean isValid = jwtUtils.validateJwtToken(token);
		return ResponseEntity.ok(isValid);
	}

	@Operation(summary = "Registrar camionero", description = "Registra un nuevo camionero en el sistema.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Registro existoso"),
			@ApiResponse(responseCode = "400", description = "Error en el registro")
	})
	@PostMapping("/signup/camionero")
	public ResponseEntity<MessageResponse> registerCamionero(@Valid @RequestBody SignupRequestCamionero signUpRequest)
			throws DataAccessException, IOException {
		if (usuarioService.existeUsuarioPorUsername(signUpRequest.getUsername()).equals(true)) {
			return ResponseEntity.badRequest().body(new MessageResponse("El nombre de usuario '"
					+ signUpRequest.getUsername() + "' ya está en uso. Por favor, elige otro."));
		}
		if (usuarioService.existeUsuarioPorEmail(signUpRequest.getEmail()).equals(true)) {
			return ResponseEntity.badRequest().body(new MessageResponse(
					"El correo electrónico '" + signUpRequest.getEmail() + "' ya está registrado."));
		}
		if (camioneroService.obtenerCamioneroPorDNI(signUpRequest.getDni()).isPresent()) {
			return ResponseEntity.badRequest().body(
					new MessageResponse("El DNI '" + signUpRequest.getDni() + "' ya está asociado a otra cuenta."));
		}
		try {
			authService.createCamionero(signUpRequest);
		} catch (InvalidNifException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("El DNI '" + signUpRequest.getDni() + "' es inválido."));
		} catch (InvalidPhoneNumberException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("El número de teléfono '" + signUpRequest.getTelefono() + "' es inválido."));
		}
		return ResponseEntity.ok(new MessageResponse("Registro exitoso!"));
	}

	@Operation(summary = "Registrar empresa", description = "Registra una nueva empresa en el sistema.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Registro exitoso"),
			@ApiResponse(responseCode = "400", description = "Error en el registro")
	})
	@PostMapping("/signup/empresa")
	public ResponseEntity<MessageResponse> registerEmpresa(@Valid @RequestBody SignupRequestEmpresa signUpRequest)
			throws DataAccessException, IOException {
		if (usuarioService.existeUsuarioPorUsername(signUpRequest.getUsername()).equals(true)) {
			return ResponseEntity.badRequest().body(new MessageResponse("El nombre de usuario '"
					+ signUpRequest.getUsername() + "' ya está en uso. Por favor, elige otro."));
		}
		if (usuarioService.existeUsuarioPorEmail(signUpRequest.getEmail()).equals(true)) {
			return ResponseEntity.badRequest().body(new MessageResponse(
					"El correo electrónico '" + signUpRequest.getEmail() + "' ya está registrado."));
		}
		if (empresaService.obtenerEmpresaPorNif(signUpRequest.getNif()).isPresent()) {
			return ResponseEntity.badRequest()
					.body(new MessageResponse("El NIF '" + signUpRequest.getNif() + "' ya está registrado."));
		}
		try {
			authService.createEmpresa(signUpRequest);
		} catch (InvalidNifException e) {
            	return ResponseEntity.badRequest().body(new MessageResponse("El NIF '" + signUpRequest.getNif() + "' es inválido."));
		} catch (InvalidPhoneNumberException e) {
            	return ResponseEntity.badRequest().body(new MessageResponse("El número de teléfono '" + signUpRequest.getTelefono() + "' es inválido."));
		}
		return ResponseEntity.ok(new MessageResponse("Registro exitoso!"));
	}

	@Operation(summary = "Editar usuario camionero", description = "Edita los datos de un usuario y su camionero.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Edición existosa"),
			@ApiResponse(responseCode = "403", description = "Acceso restringido"),
			@ApiResponse(responseCode = "400", description = "Error en la edición")
	})
	@PutMapping("/edit/camionero")
	public ResponseEntity<MessageResponse> editCamionero(@Valid @RequestBody EditRequestCamionero editRequest)
			throws DataAccessException, IOException, InvalidNifException, InvalidPhoneNumberException {
		Usuario usuario = null;
		try {
			usuario = usuarioService.obtenerUsuarioActual();
		} catch (ResourceNotFoundException e) {
			return new ResponseEntity<>(
					new MessageResponse("Debe iniciar sesión para editar su usuario."),
					HttpStatus.FORBIDDEN);
		}

		if (!usuario.getAuthority().getAuthority().equals("CAMIONERO")) {
			return new ResponseEntity<>(
					new MessageResponse("Debe iniciar sesión con un camionero para editar su usuario."),
					HttpStatus.FORBIDDEN);
		}
		Camionero camionero = camioneroService.obtenerCamioneroPorUsuario(usuario.getId());

		if (!usuario.getEmail().equals(editRequest.getEmail())
				&& usuarioService.existeUsuarioPorEmail(editRequest.getEmail()).equals(true)) {
			return ResponseEntity.badRequest().body(
					new MessageResponse("El correo electrónico '" + editRequest.getEmail() + "' ya está registrado."));
		}

		try {
			authService.editCamionero(editRequest, usuario, camionero);			
		} catch (InvalidPhoneNumberException e) { // No hace falta comprobar InvalidNifException porque no se puede editar el DNI
			return ResponseEntity.badRequest().body( 
					new MessageResponse("El número de teléfono '" + editRequest.getTelefono() + "' no es válido."));
		} catch (DataAccessException e) {												//Atrapa los demás errores genéricos, por si acaso
			return ResponseEntity.badRequest().body(
					new MessageResponse("Error al acceder a los datos: " + e.getMessage()));
		} catch (Exception e) { //Atrapa los demás errores genéricos, por si acaso
			return ResponseEntity.badRequest().body(
					new MessageResponse("Error en la edición del camionero: " + e.getMessage()));
		}
		return ResponseEntity.ok(new MessageResponse("Edición exitosa!"));
	}

	@Operation(summary = "Editar usuario empresa", description = "Edita los datos de un usuario y su empresa.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Edición exitosa"),
			@ApiResponse(responseCode = "403", description = "Acceso restringido"),
			@ApiResponse(responseCode = "400", description = "Error en la edición")
	})
	@PutMapping("/edit/empresa")
	public ResponseEntity<MessageResponse> editEmpresa(@Valid @RequestBody EditRequestEmpresa editRequest)
			throws DataAccessException, IOException {
		Usuario usuario = null;
		try {
			usuario = usuarioService.obtenerUsuarioActual();
		} catch (ResourceNotFoundException e) {
			return new ResponseEntity<>(
					new MessageResponse("Debe iniciar sesión para editar su usuario."),
					HttpStatus.FORBIDDEN);
		}

		if (!usuario.getAuthority().getAuthority().equals("EMPRESA")) {
			return new ResponseEntity<>(
					new MessageResponse("Debe iniciar sesión con una empresa para editar su usuario."),
					HttpStatus.FORBIDDEN);
		}
		Empresa empresa = empresaService.obtenerEmpresaPorUsuario(usuario.getId()).get();

		if (!usuario.getEmail().equals(editRequest.getEmail())
				&& usuarioService.existeUsuarioPorEmail(editRequest.getEmail()).equals(true)) {
			return ResponseEntity.badRequest().body(
					new MessageResponse("El correo electrónico '" + editRequest.getEmail() + "' ya está registrado."));
		}
		if (!empresa.getNif().equals(editRequest.getNif())
				&& empresaService.obtenerEmpresaPorNif(editRequest.getNif()).isPresent()) {
			return ResponseEntity.badRequest()
					.body(new MessageResponse("El NIF '" + editRequest.getNif() + "' ya está registrado."));
		}
		try {
			authService.editEmpresa(editRequest, usuario, empresa);
		} catch (InvalidNifException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("El NIF '" + editRequest.getNif() + "' es inválido."));
		} catch (InvalidPhoneNumberException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("El número de teléfono '" + editRequest.getTelefono() + "' es inválido."));
		} catch (DataAccessException e) {												
			return ResponseEntity.badRequest().body(new MessageResponse("Error al acceder a los datos: " + e.getMessage()));
		} catch (Exception e) {	//Atrapa los demás errores genéricos, por si acaso
            return ResponseEntity.badRequest().body(new MessageResponse("Error en la edición de la empresa: " + e.getMessage()));
		}
		return ResponseEntity.ok(new MessageResponse("Edición exitosa!"));
	}

}
