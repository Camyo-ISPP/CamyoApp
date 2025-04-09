package com.camyo.backend.resena;

import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.camyo.backend.usuario.Authorities;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

@WebMvcTest(ResenaController.class)  // solo carga el Controller
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ResenaControllerTests {

    @Autowired
    private MockMvc mockMvc;

    // Mockeamos los servicios que usa el Controller:
    @MockitoBean
    private ResenaService resenaService;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private OfertaService ofertaService;

    private Usuario comentado;
    private Usuario comentador;
    private Resena r1, r2;

    @BeforeAll
    void setup() {
        // Creamos un Authorities (dummy) para que "authority" no sea nulo
        Authorities dummyAuth = new Authorities();
        dummyAuth.setId(1);
        dummyAuth.setAuthority("ROLE_USER");

        comentado = new Usuario();
        comentado.setId(1);
        comentado.setUsername("UserComentado");
        comentado.setEmail("comentado@email");
        comentado.setAuthority(dummyAuth); // Evitamos la ConstraintViolation

        comentador = new Usuario();
        comentador.setId(2);
        comentador.setUsername("UserComentador");
        comentador.setEmail("otro@email");
        comentador.setAuthority(dummyAuth); // Igualmente

        r1 = new Resena();
        r1.setId(101);
        r1.setValoracion(5);
        r1.setComentado(comentado);
        r1.setComentador(comentador);

        r2 = new Resena();
        r2.setId(102);
        r2.setValoracion(2);
        r2.setComentado(comentado);
        r2.setComentador(comentador);
    }

    @Test
    void testObtenerResenaPorId_Exito() throws Exception {
        when(resenaService.obtenerResena(101)).thenReturn(r1);

        mockMvc.perform(get("/resenas/{id}", 101))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(101))
               .andExpect(jsonPath("$.valoracion").value(5));
    }

    @Test
    void testObtenerResenaPorId_NoEncontrado() throws Exception {
        when(resenaService.obtenerResena(999))
            .thenThrow(new ResourceNotFoundException("Resena", "id", 999));

        mockMvc.perform(get("/resenas/{id}", 999))
               .andExpect(status().isNotFound());
    }

    @Test
    void testObtenerResenasPorComentado() throws Exception {
        when(resenaService.obtenerTodasResenasComentadoPorId(1))
            .thenReturn(List.of(r1, r2));

        mockMvc.perform(get("/resenas/comentado/{userId}", 1))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void testEliminarResena_Exito() throws Exception {
        // la reseña 101 pertenece a "comentador" con ID=2
        when(resenaService.obtenerResena(101)).thenReturn(r1);
        // Suponemos que el usuario actual es el comentador => OK
        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);

        // Sin excepción => se elimina con éxito
        mockMvc.perform(delete("/resenas/{id}", 101))
               .andExpect(status().isNoContent());
    }

    @Test
    void testEliminarResena_UsuarioNoCoincide() throws Exception {
        when(resenaService.obtenerResena(101)).thenReturn(r1);

        // usuario actual con ID diferente => no coincide
        Usuario otro = new Usuario();
        otro.setId(99);
        otro.setAuthority(new Authorities()); // no nulo
        when(usuarioService.obtenerUsuarioActual()).thenReturn(otro);

        mockMvc.perform(delete("/resenas/{id}", 101))
               .andExpect(status().isForbidden())
               .andExpect(content().string("No tienes permiso para borrar esta reseña."));
    }
}
