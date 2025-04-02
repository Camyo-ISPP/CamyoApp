package com.camyo.backend.usuario;

import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;

@WebMvcTest(UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false)  // Quita seguridad
class UsuarioControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UsuarioService usuarioService;

    @MockBean
    private AuthoritiesService authService;

    @Test
    void testCrearUsuario_Exito() throws Exception {
        // JSON que enviamos. Nota: authority no es null
        String jsonBody = """
        {
          "nombre":"Laura",
          "email":"laura@example.com",
          "password":"plain123",
          "authority": { "id":1, "authority":"ROLE_USER" }
        }
        """;

        Usuario guardado = new Usuario();
        guardado.setId(3);
        guardado.setNombre("Laura");
        guardado.setEmail("laura@example.com");

        when(usuarioService.guardarUsuario(any(Usuario.class))).thenReturn(guardado);

        mockMvc.perform(post("/usuarios")
               .contentType(MediaType.APPLICATION_JSON)
               .content(jsonBody))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(3))
               .andExpect(jsonPath("$.nombre").value("Laura"))
               .andExpect(jsonPath("$.email").value("laura@example.com"));
    }

    @Test
    void testObtenerUsuarioPorId_NoEncontrado() throws Exception {
        doThrow(new ResourceNotFoundException("Usuario", "id", 99))
            .when(usuarioService).obtenerUsuarioPorId(99);

        mockMvc.perform(get("/usuarios/{id}", 99))
               .andExpect(status().isNotFound());
    }
    @Test
    void testObtenerUsuarios_Exito() throws Exception {
        Usuario u1 = new Usuario();
        u1.setId(1); u1.setNombre("Alice");
        Usuario u2 = new Usuario();
        u2.setId(2); u2.setNombre("Bob");

        when(usuarioService.obtenerUsuarios()).thenReturn(Arrays.asList(u1,u2));

        mockMvc.perform(get("/usuarios"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].id").value(1))
               .andExpect(jsonPath("$[0].nombre").value("Alice"))
               .andExpect(jsonPath("$[1].id").value(2))
               .andExpect(jsonPath("$[1].nombre").value("Bob"));
    }

    @Test
    void testEliminarUsuario_Exito() throws Exception {
        Usuario existente = new Usuario();
        existente.setId(5);

        when(usuarioService.obtenerUsuarioPorId(5)).thenReturn(existente);
        // no exception => se elimina con exito

        mockMvc.perform(delete("/usuarios/{id}", 5))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Usuario eliminado con éxito!"));
    }


}
