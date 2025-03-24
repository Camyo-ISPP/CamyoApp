package com.camyo.backend.auth;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.camyo.backend.auth.payload.request.SignupRequestCamionero;
import com.camyo.backend.auth.payload.request.SignupRequestEmpresa;
import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.Suscripcion;
import com.camyo.backend.suscripcion.SuscripcionRepository;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@Service
public class AuthService {

    private final PasswordEncoder encoder;
	private final AuthoritiesService authoritiesService;
	private final UsuarioService usuarioService;
	private final CamioneroService camioneroService;
	private final EmpresaService empresaService;
	private final SuscripcionService suscripcionService;

	@Autowired
	public AuthService(PasswordEncoder encoder, AuthoritiesService authoritiesService, 
					   UsuarioService usuarioService, CamioneroService camioneroService, 
					   EmpresaService empresaService, SuscripcionService suscripcionService) {
		this.encoder = encoder;
		this.authoritiesService = authoritiesService;
		this.usuarioService = usuarioService;
		this.camioneroService = camioneroService;
		this.empresaService = empresaService;
		this.suscripcionService = suscripcionService;
	}

	@Transactional
	public void createCamionero(@Valid SignupRequestCamionero request) throws DataAccessException, IOException {
		Usuario usuario = new Usuario();
		usuario.setUsername(request.getUsername());
		usuario.setPassword(request.getPassword());
		usuario.setEmail(request.getEmail());
		usuario.setLocalizacion(request.getLocalizacion());
		usuario.setTelefono(request.getTelefono());
		usuario.setNombre(request.getNombre());
		usuario.setFoto(request.getFoto());
		if (request.getDescripcion() != null) {
			usuario.setDescripcion(request.getDescripcion());
		}
		Authorities role = authoritiesService.findByAuthority("CAMIONERO");
		usuario.setAuthority(role);
		usuarioService.guardarUsuario(usuario);
		Camionero camionero = new Camionero();
		camionero.setUsuario(usuario);
		camionero.setDni(request.getDni());
		camionero.setLicencias(request.getLicencias());
		camionero.setDisponibilidad(request.getDisponibilidad());
		camionero.setTieneCAP(request.getTieneCAP());
		camionero.setExperiencia(request.getExperiencia());
		if (request.getExpiracionCAP() != null) {
			camionero.setExpiracionCAP(request.getExpiracionCAP());
		}
		camioneroService.guardarCamionero(camionero);
		if (request.getTarjetasAutonomo() != null) {
			camionero.setTarjetasAutonomo(request.getTarjetasAutonomo());
		}
	}

	@Transactional
	public void createEmpresa(@Valid SignupRequestEmpresa request) throws DataAccessException, IOException {
		Usuario usuario = new Usuario();
		usuario.setUsername(request.getUsername());
		usuario.setPassword(request.getPassword());
		usuario.setEmail(request.getEmail());
		usuario.setLocalizacion(request.getLocalizacion());
		usuario.setTelefono(request.getTelefono());
		usuario.setNombre(request.getNombre());
		usuario.setFoto(request.getFoto());
		if (request.getDescripcion() != null) {
			usuario.setDescripcion(request.getDescripcion());
		}
		Authorities role = authoritiesService.findByAuthority("EMPRESA");
		usuario.setAuthority(role);
		usuarioService.guardarUsuario(usuario);
		Empresa empresa = new Empresa();
		empresa.setUsuario(usuario);
		empresa.setNif(request.getNif());
		empresa.setWeb(request.getWeb());
		empresaService.guardarEmpresa(empresa);
		suscripcionService.asignarSuscripcion(empresa.getId(), PlanNivel.GRATIS, null);
	}
    
}
