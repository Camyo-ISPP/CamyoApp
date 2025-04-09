package com.camyo.backend.usuario;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.auth.payload.response.MessageResponse;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.http.MediaType;

@WebMvcTest(
    value = {UsuarioController.class},
    properties = {"security.BASICO.enabled=false"}
)
@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc(addFilters = false)
class UsuarioControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private AuthoritiesService authService;

    private Usuario u1;

    @BeforeAll
    void setup() {
        u1 = new Usuario();
        u1.setId(5);
        u1.setNombre("Alice");
        u1.setEmail("alice@test.com");
        u1.setUsername("aliceUser");
    }


    @Test
    void testObtenerUsuarioPorId_Exito() throws Exception {
        when(usuarioService.obtenerUsuarioPorId(5)).thenReturn(u1);

        mockMvc.perform(get("/usuarios/{id}",5))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.nombre").value("Alice"));
    }


    @Test
    void testObtenerUsuarioPorId_NoEncontrado() throws Exception {
        doThrow(new ResourceNotFoundException("Usuario","id",99))
            .when(usuarioService).obtenerUsuarioPorId(99);

        mockMvc.perform(get("/usuarios/{id}",99))
               .andExpect(status().isNotFound());
    }





@Test
void testEliminarUsuario_NoEncontrado() throws Exception {
    doThrow(new ResourceNotFoundException("Usuario","id",99))
        .when(usuarioService).eliminarUsuario(99);


    mockMvc.perform(delete("/usuarios/{id}", 99))
           .andExpect(status().isNotFound());
         
}


 
    @Test
    void testEliminarUsuario_Exito() throws Exception {
        // no excepción => se elimina con éxito
        // Para que no lance ResourceNotFound, simulas que sí existe
        Usuario ex = new Usuario();
        ex.setId(7);
        when(usuarioService.obtenerUsuarioPorId(7)).thenReturn(ex);

        mockMvc.perform(delete("/usuarios/{id}",7))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Usuario eliminado con éxito!"));
    }


}
