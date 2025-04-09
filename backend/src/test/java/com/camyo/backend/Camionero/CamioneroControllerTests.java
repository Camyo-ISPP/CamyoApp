package com.camyo.backend.Camionero;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroController;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.camionero.Disponibilidad;
import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.resena.Resena;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ActiveProfiles("test")
@WebMvcTest(
    value = { CamioneroController.class},
    properties = {"security.BASICO.enabled=false"})
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc(addFilters =  false)
public class CamioneroControllerTests {
    
	private static final String BASE_URL = "/camioneros";

    @Autowired
    private CamioneroController camioneroController;

    @MockitoBean
    private CamioneroService camioneroService;

    @MockitoBean
    private UsuarioService usuarioService;

    @Autowired
	private ObjectMapper objectMapper;

    @Autowired
	private MockMvc mockMvc;

     /*
    * Declaramos las variables que vayamos a usar fuera del setup 
  */ 

    Camionero c1;
    Camionero c2;
    Usuario testUser;
    Camionero testCamionero;

    @BeforeAll
    @Transactional
    void setup(){

          /*
         * Crea authorities de camionero y empresa
       */

        Authorities authCam = new Authorities();
        authCam.setAuthority("Camionero");

        Authorities authEmp = new Authorities();
        authCam.setAuthority("Empresa");

          /*
         * Crea usuarios para los camioneros, dos de empresa para las reseñas, y uno de prueba para crear camionero
       */

        Usuario u1 = new Usuario();
        u1.setId(1);
        u1.setNombre("Manolo");
        u1.setTelefono("123456879");
        u1.setUsername("Manolongo");
        u1.setPassword("12");
        u1.setEmail("manolongo@gmail.com");
        u1.setAuthority(authCam);

        Usuario u2 = new Usuario();
        u2.setId(2);
        u2.setNombre("Paco");
        u2.setTelefono("123456872");
        u2.setUsername("Pacomé");
        u2.setPassword("12");
        u2.setEmail("pacome@gmail.com");
        u2.setAuthority(authCam);

        Usuario u3 = new Usuario();
        u3.setId(3);
        u3.setNombre("José");
        u3.setTelefono("341256872");
        u3.setUsername("Joselito");
        u3.setPassword("12");
        u3.setEmail("pa23@gmail.com");
        u3.setAuthority(authEmp);

        Usuario u4 = new Usuario();
        u4.setId(4);
        u4.setNombre("Carlos");
        u4.setTelefono("681234572");
        u4.setUsername("Carlongo");
        u4.setPassword("12");
        u4.setEmail("caralingo@gmail.com");
        u4.setAuthority(authEmp);

        testUser = new Usuario();
        testUser.setId(1);
        testUser.setNombre("Rogelio");
        testUser.setTelefono("123996879");
        testUser.setUsername("Rogelingo");
        testUser.setPassword("12");
        testUser.setEmail("rogelingo@gmail.com");

          /*
         * Crea reseñas para el camionero 1 cuya media es 4
       */
        
        Resena resena1 = new Resena();
        resena1.setValoracion(5);
        resena1.setComentado(u1);
        resena1.setComentador(u3);

        Resena resena2 = new Resena();
        resena2.setValoracion(3);
        resena2.setComentado(u1);
        resena2.setComentador(u4);

          /*
         * Crea dos camioneros
       */
        
        c1 = new Camionero();
        c1.setId(1);
        c1.setExperiencia(10);
        c1.setDni("wztJbQZPeh+nKUnOaFj+/A==");
        c1.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c1.setDisponibilidad(Disponibilidad.NACIONAL);
        c1.setTieneCAP(true);
        c1.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c1.setUsuario(u1);

        c2 = new Camionero();
        c2.setId(2);
        c2.setExperiencia(10);
        c2.setDni("ftLHmnSLKCLLarKQniejsw==");
        c2.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c2.setDisponibilidad(Disponibilidad.NACIONAL);
        c2.setTieneCAP(true);
        c2.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c2.setUsuario(u2);

        testCamionero = new Camionero();
        testCamionero.setId(3);
        testCamionero.setExperiencia(12);
        testCamionero.setDni("tw1mOz4WZSu3PtwCcErV3Q=="); //12445679P
        testCamionero.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        testCamionero.setDisponibilidad(Disponibilidad.NACIONAL);
        testCamionero.setTieneCAP(true);
        testCamionero.setExpiracionCAP(LocalDate.of(2025, 12, 12));
    }


    @Test
    void debeObtenerCamioneroPorId() throws Exception{
        Integer id = c1.getId();
        String nombre = c1.getUsuario().getNombre();

        when(this.camioneroService.obtenerCamioneroPorId(id)).thenReturn(c1);
        mockMvc.perform(get(String.format(BASE_URL + "/%d", id))).andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario.nombre").value(nombre));
    }

    @Test
    void noDebeObtenerCamioneroPorId() throws Exception{
        Integer id = 20;
        when(this.camioneroService.obtenerCamioneroPorId(id))
            .thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(get(String.format(BASE_URL + "/%d", id))).andExpect(status().isNotFound());
    }

    @Test
    void debeObtenerCamioneroPorUsuario() throws Exception{
        Integer id = c1.getUsuario().getId();
        String nombre = c1.getUsuario().getNombre();

        when(this.camioneroService.obtenerCamioneroPorUsuario(id)).thenReturn(c1);
        mockMvc.perform(get(String.format(BASE_URL + "/por_usuario/%d", id))).andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario.nombre").value(nombre));
    }

    @Test
    void noDebeObtenerCamioneroPorUsuario() throws Exception{
        Integer id = 20;
        when(this.camioneroService.obtenerCamioneroPorUsuario(id))
            .thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(get(String.format(BASE_URL + "/por_usuario/%d", id))).andExpect(status().isNotFound());
    }

     /*
    * Deprecated controller call, no testing necessary 
  */ 

    @Test
    void debeGuardarCamionero() throws Exception{
        
    }

}
