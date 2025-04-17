package com.camyo.backend.Auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.auth.AuthController;
import com.camyo.backend.auth.AuthService;
import com.camyo.backend.auth.payload.request.EditRequestCamionero;
import com.camyo.backend.auth.payload.request.EditRequestEmpresa;
import com.camyo.backend.auth.payload.request.LoginRequest;
import com.camyo.backend.auth.payload.request.SignupRequestCamionero;
import com.camyo.backend.auth.payload.request.SignupRequestEmpresa;
import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.camionero.Disponibilidad;
import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.configuration.jwt.JwtUtils;
import com.camyo.backend.configuration.services.UserDetailsImpl;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.InvalidNifException;
import com.camyo.backend.exceptions.InvalidPhoneNumberException;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ActiveProfiles("test")
@WebMvcTest(
    value = { AuthController.class },
    properties = { "security.BASICO.enabled=false" })
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private EmpresaService empresaService;

    @MockitoBean
    private CamioneroService camioneroService;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private JwtUtils jwtUtils;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    Authentication auth;

    private LoginRequest loginRequest;
	private SignupRequestCamionero signupRequestCamionero;
	private SignupRequestEmpresa signupRequestEmpresa;
	private UserDetailsImpl userDetails;
    private EditRequestCamionero editRequestCamionero;
    private EditRequestEmpresa editRequestEmpresa;

	private String token;

    private static final String BASE_URL = "/auth";
    
    @Transactional
    @BeforeAll
	void setup() {
		loginRequest = new LoginRequest();
        loginRequest.setUsername("testUser");
        loginRequest.setPassword("password");

		signupRequestCamionero = new SignupRequestCamionero();
		signupRequestCamionero.setUsername("usernameCam");
		signupRequestCamionero.setPassword("passwordCam");
		signupRequestCamionero.setEmail("authtestCamionero@test.com");
        signupRequestCamionero.setNombre("Test Camionero");
        signupRequestCamionero.setTelefono("644123432");
        signupRequestCamionero.setDescripcion("Descripción test");
        signupRequestCamionero.setDisponibilidad(Disponibilidad.NACIONAL);
        signupRequestCamionero.setDni("23456789D");
        signupRequestCamionero.setExperiencia(12);
        signupRequestCamionero.setLicencias(Set.of(Licencia.C));
        signupRequestCamionero.setLocalizacion("Sevilla");
        signupRequestCamionero.setTieneCAP(false);

        signupRequestEmpresa = new SignupRequestEmpresa();
		signupRequestEmpresa.setUsername("usernameEmp");
		signupRequestEmpresa.setPassword("passwordEmp");
		signupRequestEmpresa.setEmail("authtestEmpresa@test.com");
        signupRequestEmpresa.setNombre("Test Empresa");
        signupRequestEmpresa.setTelefono("644123432");
        signupRequestEmpresa.setDescripcion("Descripción test");
        signupRequestEmpresa.setLocalizacion("Sevilla");
        signupRequestEmpresa.setNif("F62374756");
        signupRequestEmpresa.setWeb("testEmp.com");

        editRequestCamionero = new EditRequestCamionero();
        editRequestCamionero.setNombre("modified name");
        editRequestCamionero.setEmail("email@gmail.com");
        editRequestCamionero.setTelefono("644123432");
        editRequestCamionero.setDescripcion("Descripción test");
        editRequestCamionero.setDisponibilidad(Disponibilidad.NACIONAL);
        editRequestCamionero.setExperiencia(12);
        editRequestCamionero.setLicencias(Set.of(Licencia.C));
        editRequestCamionero.setLocalizacion("Sevilla");
        editRequestCamionero.setTieneCAP(false);
        editRequestCamionero.setFoto(new byte[4]);

        editRequestEmpresa = new EditRequestEmpresa();
        editRequestEmpresa.setNombre("modified name");
        editRequestEmpresa.setEmail("email@gmail.com");
        editRequestEmpresa.setTelefono("644123432");
        editRequestEmpresa.setDescripcion("Descripción test");
        editRequestEmpresa.setLocalizacion("Sevilla");
        editRequestEmpresa.setNif("F62374756");
        editRequestEmpresa.setWeb("testEmp.com");
        editRequestEmpresa.setFoto(new byte[4]);

		userDetails = new UserDetailsImpl(1, loginRequest.getUsername(), loginRequest.getPassword(),
				List.of(new SimpleGrantedAuthority("OWNER")));

		token = "JWT TOKEN";
	}

    @Test
    void debeAutenticarUsuario() throws Exception {        

        when(usuarioService.existeUsuarioPorUsername(loginRequest.getUsername())).thenReturn(true);
		when(this.jwtUtils.generateJwtToken(any(Authentication.class))).thenReturn(token);
		when(this.authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
		Mockito.doReturn(userDetails).when(auth).getPrincipal();

		mockMvc.perform(post(BASE_URL + "/signin").contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(loginRequest))).andExpect(status().isOk());
    }

    @Test
    void noDebeAutenticarUsuarioConCredencialesInvalidas() throws Exception {

        when(usuarioService.existeUsuarioPorUsername(loginRequest.getUsername())).thenReturn(true);
		when(this.authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenThrow(BadCredentialsException.class);
		Mockito.doReturn(userDetails).when(auth).getPrincipal();

        mockMvc.perform(post(BASE_URL + "/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void noDebeAutenticarUsuarioConUsernameNoExistente() throws Exception {

        when(usuarioService.existeUsuarioPorUsername(loginRequest.getUsername())).thenReturn(false);

        mockMvc.perform(post(BASE_URL + "/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isNotFound());
    }

    @Test
    void debeValidarToken() throws Exception {

        when(jwtUtils.validateJwtToken(token)).thenReturn(true);

        mockMvc.perform(get(BASE_URL + "/validate")
                .param("token", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").value(true));
    }

    @Test
    void debeRegisterCamionero() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestCamionero.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestCamionero.getEmail())).thenReturn(false);
        when(camioneroService.obtenerCamioneroPorDNI(signupRequestCamionero.getDni())).thenReturn(Optional.empty());
        
        mockMvc.perform(post(BASE_URL + "/signup/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestCamionero)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registro exitoso!"));
                
    }

    @Test
    void noDebeRegisterCamioneroConUsernameExistente() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestCamionero.getUsername())).thenReturn(true);
        
        mockMvc.perform(post(BASE_URL + "/signup/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterCamioneroConEmailExistente() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestCamionero.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestCamionero.getEmail())).thenReturn(true);
        
        mockMvc.perform(post(BASE_URL + "/signup/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterCamioneroConDniExistente() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestCamionero.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestCamionero.getEmail())).thenReturn(false);
        when(camioneroService.obtenerCamioneroPorDNI(signupRequestCamionero.getDni())).thenReturn(Optional.of(new Camionero()));
        
        mockMvc.perform(post(BASE_URL + "/signup/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterCamioneroConDniInvalido() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestCamionero.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestCamionero.getEmail())).thenReturn(false);
        when(camioneroService.obtenerCamioneroPorDNI(signupRequestCamionero.getDni())).thenReturn(Optional.empty());
        doThrow(InvalidNifException.class).when(authService).createCamionero(any(SignupRequestCamionero.class));
        

        mockMvc.perform(post(BASE_URL + "/signup/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterCamioneroConNumeroTlfInvalido() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestCamionero.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestCamionero.getEmail())).thenReturn(false);
        when(camioneroService.obtenerCamioneroPorDNI(signupRequestCamionero.getDni())).thenReturn(Optional.empty());
        doThrow(InvalidPhoneNumberException.class).when(authService).createCamionero(any(SignupRequestCamionero.class));
        

        mockMvc.perform(post(BASE_URL + "/signup/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void debeRegisterEmpresa() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestEmpresa.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestEmpresa.getEmail())).thenReturn(false);
        when(empresaService.obtenerEmpresaPorNif(signupRequestEmpresa.getNif())).thenReturn(Optional.empty());
        
        mockMvc.perform(post(BASE_URL + "/signup/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestEmpresa)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registro exitoso!"));
                
    }

    @Test
    void noDebeRegisterEmpresaConUsernameExistente() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestEmpresa.getUsername())).thenReturn(true);
        
        mockMvc.perform(post(BASE_URL + "/signup/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterEmpresaConEmailExistente() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestEmpresa.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestEmpresa.getEmail())).thenReturn(true);
        
        mockMvc.perform(post(BASE_URL + "/signup/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterEmpresaConDniExistente() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestEmpresa.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestEmpresa.getEmail())).thenReturn(false);
        when(empresaService.obtenerEmpresaPorNif(signupRequestEmpresa.getNif())).thenReturn(Optional.of(new Empresa()));
        
        mockMvc.perform(post(BASE_URL + "/signup/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterEmpresaConDniInvalido() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestEmpresa.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestEmpresa.getEmail())).thenReturn(false);
        when(empresaService.obtenerEmpresaPorNif(signupRequestEmpresa.getNif())).thenReturn(Optional.empty());
        doThrow(InvalidNifException.class).when(authService).createEmpresa(any(SignupRequestEmpresa.class));
        

        mockMvc.perform(post(BASE_URL + "/signup/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void noDebeRegisterEmpresaConNumeroTlfInvalido() throws Exception{
        
        
        when(usuarioService.existeUsuarioPorUsername(signupRequestEmpresa.getUsername())).thenReturn(false);
        when(usuarioService.existeUsuarioPorEmail(signupRequestEmpresa.getEmail())).thenReturn(false);
        when(empresaService.obtenerEmpresaPorNif(signupRequestEmpresa.getNif())).thenReturn(Optional.empty());
        doThrow(InvalidPhoneNumberException.class).when(authService).createEmpresa(any(SignupRequestEmpresa.class));
        

        mockMvc.perform(post(BASE_URL + "/signup/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
                
    }

    @Test
    void debeEditarCamioneroModificandoEmail() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(camioneroService.obtenerCamioneroPorUsuario(anyInt())).thenReturn(new Camionero());
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Edición exitosa!"));

    }

    @Test
    void debeEditarCamioneroSinModificarEmail() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(camioneroService.obtenerCamioneroPorUsuario(anyInt())).thenReturn(new Camionero());
        when(usuario.getEmail()).thenReturn(editRequestCamionero.getEmail());
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(true);

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Edición exitosa!"));

    }

    @Test
    void noDebeEditarCamioneroSinIniciarSesion() throws Exception{
        Authorities authority = new Authorities();
        authority.setAuthority("CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenThrow(new ResourceNotFoundException("usuario"));
        

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());

    }

    @Test
    void noDebeEditarCamioneroSinSerCamionero() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("NO CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isForbidden());

    }

    @Test
    void noDebeEditarCamioneroCambiandoEmailYaExistente() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(camioneroService.obtenerCamioneroPorUsuario(anyInt())).thenReturn(new Camionero());
        when(usuario.getEmail()).thenReturn("alreadyUsedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(true);

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

    }

    @Test
    void noDebeEditarCamioneroConTelefonoInvalido() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(camioneroService.obtenerCamioneroPorUsuario(anyInt())).thenReturn(new Camionero());
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);
        doThrow(new InvalidPhoneNumberException()).when(authService).editCamionero(any(), any(), any());

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void noDebeEditarCamioneroConErrorDeAccesoDatos() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(camioneroService.obtenerCamioneroPorUsuario(anyInt())).thenReturn(new Camionero());
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);
        doThrow(new DataAccessResourceFailureException("test")).when(authService).editCamionero(any(), any(), any());

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error al acceder a los datos: test"));
    }

    @Test
    void noDebeEditarCamioneroConCualquierOtroErrorDeEdicion() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("CAMIONERO");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(camioneroService.obtenerCamioneroPorUsuario(anyInt())).thenReturn(new Camionero());
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);
        doThrow(new IOException()).when(authService).editCamionero(any(), any(), any());

        mockMvc.perform(put(BASE_URL + "/edit/camionero")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestCamionero)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error en la edición del camionero: null"));
    }


    
    @Test
    void debeEditarEmpresaModificandoEmail() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");
        Empresa e = new Empresa();
        e.setNif(editRequestEmpresa.getNif());

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(e));
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Edición exitosa!"));

    }

    @Test
    void debeEditarEmpresaSinModificarEmail() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");
        Empresa e = new Empresa();
        e.setNif(editRequestEmpresa.getNif());

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(e));
        when(usuario.getEmail()).thenReturn(editRequestEmpresa.getEmail());
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Edición exitosa!"));

    }

    @Test
    void noDebeEditarEmpresaSinIniciarSesion() throws Exception{
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");

        when(usuarioService.obtenerUsuarioActual()).thenThrow(new ResourceNotFoundException("usuario"));
        

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());

    }

    @Test
    void noDebeEditarEmpresaSinSerCamionero() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("NO EMPRESA");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isForbidden());

    }

    @Test
    void noDebeEditarEmpresaCambiandoEmailYaExistente() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(new Empresa()));
        when(usuario.getEmail()).thenReturn("alreadyUsedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(true);

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El correo electrónico '" + editRequestEmpresa.getEmail() + "' ya está registrado."));
    }

    @Test
    void noDebeEditarEmpresaCambiandoNifYaExistente() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");
        Empresa e = new Empresa();
        e.setNif("NIFdistinto");

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(e));
        when(usuario.getEmail()).thenReturn(editRequestEmpresa.getEmail());
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);

        when(empresaService.obtenerEmpresaPorNif(anyString())).thenReturn(Optional.of(e));

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El NIF '" + editRequestEmpresa.getNif() + "' ya está registrado."));
    }

    @Test
    void noDebeEditarEmpresaConTelefonoInvalido() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");
        Empresa e = new Empresa();
        e.setNif(editRequestEmpresa.getNif());

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(e));
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");                               
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);
        doThrow(new InvalidPhoneNumberException()).when(authService).editEmpresa(any(), any(), any());

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void noDebeEditarEmpresaConNifInvalido() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");
        
        Empresa e = new Empresa();
        e.setNif(editRequestEmpresa.getNif());

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(e));
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);
        doThrow(new InvalidNifException()).when(authService).editEmpresa(any(), any(), any());

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void noDebeEditarEmpresaConErrorDeAccesoDatos() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");
        
        Empresa e = new Empresa();
        e.setNif(editRequestEmpresa.getNif());

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(e));
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);
        doThrow(new DataAccessResourceFailureException("test")).when(authService).editEmpresa(any(), any(), any());

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error al acceder a los datos: test"));
    }

    @Test
    void noDebeEditarEmpresaConCualquierOtroErrorDeEdicion() throws Exception{
        Usuario usuario = Mockito.mock(Usuario.class);
        Authorities authority = new Authorities();
        authority.setAuthority("EMPRESA");
        
        Empresa e = new Empresa();
        e.setNif(editRequestEmpresa.getNif());

        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuario);
        when(usuario.getAuthority()).thenReturn(authority);
        when(empresaService.obtenerEmpresaPorUsuario(anyInt())).thenReturn(Optional.of(e));
        when(usuario.getEmail()).thenReturn("modifiedEmail@gmail.com");
        when(usuarioService.existeUsuarioPorEmail(anyString())).thenReturn(false);
        doThrow(new IOException()).when(authService).editEmpresa(any(), any(), any());

        mockMvc.perform(put(BASE_URL + "/edit/empresa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequestEmpresa)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error en la edición de la empresa: null"));
    }
}