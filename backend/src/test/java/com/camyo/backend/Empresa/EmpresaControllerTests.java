package com.camyo.backend.Empresa;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
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

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaController;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

@ActiveProfiles("test")
@WebMvcTest(
    value = { EmpresaController.class},
    properties = {"security.basic.enabled=false"})
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc(addFilters =  false)
public class EmpresaControllerTests {
    
	private static final String BASE_URL = "/empresas";

    @Autowired
    private EmpresaController empresaController;

    @MockitoBean
    private EmpresaService empresaService;

    @MockitoBean
    private UsuarioService usuarioService;

    @Autowired
	private ObjectMapper objectMapper;

    @Autowired
	private MockMvc mockMvc;

     /*
    * Declaramos las variables que vayamos a usar fuera del setup 
  */ 

    Empresa e1;
    Empresa e2;
    Usuario testUser;
    Empresa testEmpresa;

    @BeforeAll
    @Transactional
    void setup(){

          /*
         * Crea authority de empresa
       */

        Authorities authEmp = new Authorities();
        authEmp.setAuthority("Empresa");

          /*
         * Crea usuarios para los empresas, dos de empresa para las reseñas, y uno de prueba para crear empresa
       */
        Usuario u1 = new Usuario();
        u1.setId(1);
        u1.setNombre("José");
        u1.setTelefono("341256872");
        u1.setUsername("Joselito");
        u1.setPassword("12");
        u1.setEmail("pa23@gmail.com");
        u1.setAuthority(authEmp);

        Usuario u2 = new Usuario();
        u2.setId(2);
        u2.setNombre("Carlos");
        u2.setTelefono("681234572");
        u2.setUsername("Carlongo");
        u2.setPassword("12");
        u2.setEmail("caralingo@gmail.com");
        u2.setAuthority(authEmp);

        testUser = new Usuario();
        testUser.setId(1);
        testUser.setNombre("Rogelio");
        testUser.setTelefono("123996879");
        testUser.setUsername("Rogelingo");
        testUser.setPassword("12");
        testUser.setEmail("rogelingo@gmail.com");

          /*
         * Crea dos empresas
       */
        
        e1 = new Empresa();
        e1.setId(1);
        e1.setWeb("https://e1.com");
        e1.setNif("A12345678");
        e1.setUsuario(u1);

        e2 = new Empresa();
        e2.setId(2);
        e2.setWeb("https://e2.com");
        e2.setNif("B12345678");
        e2.setUsuario(u2);
    }

    @Test
    void debeObtenerTodosEmpresas() throws Exception{
        String nombre1 = e1.getUsuario().getNombre();
        String nombre2 = e2.getUsuario().getNombre();
        when(this.empresaService.obtenerTodasEmpresas()).thenReturn(List.of(e1, e2));
        mockMvc.perform(get(BASE_URL)).andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[?(@.id == 1)].usuario.nombre").value(nombre1))
            .andExpect(jsonPath("$[?(@.id == 2)].usuario.nombre").value(nombre2));
    }

    @Test
    void debeObtenerEmpresaPorId() throws Exception{
        Integer id = e1.getId();
        String nombre = e1.getUsuario().getNombre();

        when(this.empresaService.obtenerEmpresaPorId(id)).thenReturn(e1);
        mockMvc.perform(get(String.format(BASE_URL + "/%d", id))).andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario.nombre").value(nombre));
    }

    @Test
    void noDebeObtenerEmpresaPorId() throws Exception{
        Integer id = 20;
        when(this.empresaService.obtenerEmpresaPorId(id))
            .thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(get(String.format(BASE_URL + "/%d", id))).andExpect(status().isNotFound());
    }

    @Test
    void debeObtenerEmpresaPorUsuario() throws Exception{
        Integer id = e1.getUsuario().getId();
        String nombre = e1.getUsuario().getNombre();

        when(this.empresaService.obtenerEmpresaPorUsuario(id)).thenReturn(Optional.of(e1));
        mockMvc.perform(get(String.format(BASE_URL + "/por_usuario/%d", id))).andExpect(status().isOk())
            .andExpect(jsonPath("$.usuario.nombre").value(nombre));
    }

    @Test
    void noDebeObtenerEmpresaPorUsuario() throws Exception{
        Integer id = 20;
        when(this.empresaService.obtenerEmpresaPorUsuario(id)).thenReturn(Optional.empty());
        mockMvc.perform(get(String.format(BASE_URL + "/por_usuario/%d", id))).andExpect(status().isNotFound());
    }
        
}

