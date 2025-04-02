package com.camyo.backend.resena;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ResenaController.class)
@AutoConfigureMockMvc(addFilters = false)  // Desactiva seguridad en los tests
class ResenaControllerTests {

    @Autowired
    private MockMvc mockMvc;

    // El ResenaController @Autowire-a ResenaService y UsuarioService
    @MockBean
    private ResenaService resenaService;

    @MockBean
    private UsuarioService usuarioService;

    @Test
    void testObtenerTodasResenasComentado_Exito() throws Exception {
        Resena r = new Resena();
        r.setId(1);
        r.setValoracion(5);

        when(resenaService.obtenerTodasResenasComentadoPorId(10))
            .thenReturn(Collections.singletonList(r));

        mockMvc.perform(get("/resenas/comentado/{id}", 10))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].id").value(1))
               .andExpect(jsonPath("$[0].valoracion").value(5));
    }

    @Test
    void testCrearResena_Exito() throws Exception {
        // JSON que enviamos en el body
        String jsonBody = """
        {
          "valoracion":5,
          "comentarios":"Perfecto",
          "comentador":{"id":1},
          "comentado":{"id":2}
        }
        """;

        // La reseña que simulamos retorna el service
        Resena creada = new Resena();
        creada.setId(99);
        creada.setValoracion(5);
        creada.setComentarios("Perfecto");

        when(resenaService.crearResena(any(Resena.class))).thenReturn(creada);

        mockMvc.perform(post("/resenas")
               .contentType(MediaType.APPLICATION_JSON)
               .content(jsonBody))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(99))
               .andExpect(jsonPath("$.valoracion").value(5))
               .andExpect(jsonPath("$.comentarios").value("Perfecto"));
    }
    
@Test
    void testObtenerResenaPorId_Exito() throws Exception {
        Resena r = new Resena();
        r.setId(10);
        r.setValoracion(4);

        when(resenaService.obtenerResena(10)).thenReturn(r);

        mockMvc.perform(get("/resenas/{id}", 10))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(10))
               .andExpect(jsonPath("$.valoracion").value(4));
    }

    @Test
    void testObtenerResenaPorId_NoEncontrada() throws Exception {
        doThrow(new ResourceNotFoundException("Resena","id",99))
            .when(resenaService).obtenerResena(99);

        mockMvc.perform(get("/resenas/{id}", 99))
               .andExpect(status().isNotFound());
    }

    @Test
    void testEliminarResena_Exito() throws Exception {
        // Asume que la reseña ID=1 pertenece al "comentador" ID=5
        Resena existente = new Resena();
        existente.setId(1);
        Usuario comentador = new Usuario();
        comentador.setId(5);
        existente.setComentador(comentador);

        // El service 'obtenerResena' retorna la reseña
        when(resenaService.obtenerResena(1)).thenReturn(existente);
        // El "usuario actual" que llamamos con "usuarioService.obtenerUsuarioActual()" 
        // para checkear si coincide con comentador
        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);

        mockMvc.perform(delete("/resenas/{id}", 1))
               .andExpect(status().isNoContent());
    }

    @Test
    void testEliminarResena_UsuarioNoCoincide() throws Exception {
        Resena existente = new Resena();
        existente.setId(1);
        Usuario comentador = new Usuario();
        comentador.setId(5);
        existente.setComentador(comentador);

        when(resenaService.obtenerResena(1)).thenReturn(existente);
        
        // El usuario actual es ID=10 => no coincide => FORBIDDEN
        Usuario usuarioDistinto = new Usuario();
        usuarioDistinto.setId(10);
        when(usuarioService.obtenerUsuarioActual()).thenReturn(usuarioDistinto);

        mockMvc.perform(delete("/resenas/{id}", 1))
               .andExpect(status().isForbidden())
               .andExpect(content().string("No tienes permiso para borrar esta reseña."));
    }
}
