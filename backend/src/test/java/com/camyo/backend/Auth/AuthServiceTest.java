package com.camyo.backend.Auth;

import java.time.LocalDate;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import com.camyo.backend.auth.AuthService;
import com.camyo.backend.auth.payload.request.EditRequestCamionero;
import com.camyo.backend.auth.payload.request.EditRequestEmpresa;
import com.camyo.backend.auth.payload.request.SignupRequestCamionero;
import com.camyo.backend.auth.payload.request.SignupRequestEmpresa;
import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.camionero.Disponibilidad;
import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.camionero.Tarjetas;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestInstance(Lifecycle.PER_CLASS)
class AuthServiceTest {

    @Autowired
    protected AuthService authService;

    @Autowired
    protected UsuarioService usuarioService;

    @Autowired
    protected CamioneroService camioneroService;

    @Autowired
    protected EmpresaService empresaService;

    @Autowired
    protected SuscripcionService suscripcionService;

    @Autowired
    protected AuthoritiesService authoritiesService;

     /*
    * Declaramos las variables que vayamos a usar fuera del setup 
  */ 
    private SignupRequestCamionero signupRequestCamionero;
    private SignupRequestEmpresa signupRequestEmpresa;

    private EditRequestCamionero editRequestCamionero;
    private EditRequestEmpresa editRequestEmpresa;

    Authorities camioneroAuth;
    Authorities empresaAuth;


    @BeforeAll
    @Transactional
    void setup(){
        camioneroAuth = new Authorities();
        camioneroAuth.setAuthority("CAMIONERO");
        authoritiesService.saveAuthorities(camioneroAuth);
        
        empresaAuth = new Authorities();
        empresaAuth.setAuthority("EMPRESA");
        authoritiesService.saveAuthorities(empresaAuth);
        
        signupRequestCamionero = new SignupRequestCamionero();
		signupRequestCamionero.setUsername("usernameCam");
		signupRequestCamionero.setPassword("passwordCam");
		signupRequestCamionero.setEmail("authtestCamionero@test.com");
        signupRequestCamionero.setNombre("Test Camionero");
        signupRequestCamionero.setTelefono("644123432");
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
        signupRequestEmpresa.setLocalizacion("Sevilla");
        signupRequestEmpresa.setNif("F62374756");
        signupRequestEmpresa.setWeb("https://testEmp.com");

        editRequestCamionero = new EditRequestCamionero();
        editRequestCamionero.setNombre("modified name");
        editRequestCamionero.setEmail("email@gmail.com");
        editRequestCamionero.setTelefono("644123432");
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
        editRequestEmpresa.setLocalizacion("Sevilla");
        editRequestEmpresa.setNif("F62374756");
        editRequestEmpresa.setWeb("https://e1.com");
        editRequestEmpresa.setFoto(new byte[4]);
    }

    @Test
    @Transactional(readOnly = false)
    void debeCrearCamioneroSinDatosOpcionales(){
        assertDoesNotThrow(() -> authService.createCamionero(signupRequestCamionero));
    }

    @Test
    @Transactional(readOnly = false)
    void debeCrearCamioneroConDatosOpcionales(){
        signupRequestCamionero.setDescripcion("Descripción");
        signupRequestCamionero.setTieneCAP(true);
        signupRequestCamionero.setExpiracionCAP(LocalDate.now().plusDays(360));
        signupRequestCamionero.setTarjetasAutonomo(Set.of(Tarjetas.MDP));
        assertDoesNotThrow(() -> authService.createCamionero(signupRequestCamionero));
    }

    @Test
    @Transactional(readOnly = false)
    void debeCrearEmpresaSinDatosOpcionales(){
        assertDoesNotThrow(() -> authService.createEmpresa(signupRequestEmpresa));
    }
    @Test
    @Transactional(readOnly = false)
    void debeCrearEmpresaConDatosOpcionales(){
        signupRequestEmpresa.setDescripcion("Descripción");
        assertDoesNotThrow(() -> authService.createEmpresa(signupRequestEmpresa));
    }

    @Test
    @Transactional(readOnly = false)
    void debeEditarEmpresaSinDatosOpcionales(){
        Usuario u = new Usuario();
        u.setAuthority(empresaAuth);
        Empresa e = new Empresa();
        
        assertDoesNotThrow(() -> authService.editEmpresa(editRequestEmpresa, u, e));
    }

    @Test
    @Transactional(readOnly = false)
    void debeEditarEmpresaConDatosOpcionales(){
        Usuario u = new Usuario();
        u.setAuthority(empresaAuth);
        Empresa e = new Empresa();
        
        editRequestEmpresa.setDescripcion("Descripción");

        assertDoesNotThrow(() -> authService.editEmpresa(editRequestEmpresa, u, e));
    }


    @Test
    @Transactional(readOnly = false)
    void debeEditarCamioneroSinDatosOpcionales(){
        Usuario u = new Usuario();
        u.setAuthority(camioneroAuth);

        Camionero c = new Camionero();
        c.setDni(signupRequestCamionero.getDni());

        assertDoesNotThrow(() -> authService.editCamionero(editRequestCamionero, u, c));
    }

    @Test
    @Transactional(readOnly = false)
    void debeEditarCamioneroConDatosOpcionales(){
        Usuario u = new Usuario();
        u.setAuthority(camioneroAuth);

        Camionero c = new Camionero();
        c.setDni(signupRequestCamionero.getDni());
        
        editRequestCamionero.setDescripcion("Descripción");
        editRequestCamionero.setTieneCAP(true);
        editRequestCamionero.setExpiracionCAP(LocalDate.now().plusDays(360));
        editRequestCamionero.setTarjetasAutonomo(Set.of(Tarjetas.MDP));

        assertDoesNotThrow(() -> authService.editCamionero(editRequestCamionero, u, c));
    }
}
