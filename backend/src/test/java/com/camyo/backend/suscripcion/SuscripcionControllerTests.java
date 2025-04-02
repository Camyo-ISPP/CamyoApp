package com.camyo.backend.suscripcion;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.camyo.backend.exceptions.ResourceNotFoundException;

import java.time.LocalDate;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SuscripcionController.class)
@AutoConfigureMockMvc(addFilters = false)
class SuscripcionControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SuscripcionService suscripcionService;

    @Test
    void testAsignarSuscripcion_Exito() throws Exception {
        // Creamos una Suscripcion de prueba que retornará el service
        Suscripcion s = new Suscripcion();
        s.setId(2);
        s.setNivel(PlanNivel.PREMIUM);
        s.setFechaInicio(LocalDate.now());
        s.setFechaFin(LocalDate.now().plusDays(15));
        s.setActiva(true);

        when(suscripcionService.asignarSuscripcion(50, PlanNivel.PREMIUM, 15)).thenReturn(s);

        mockMvc.perform(post("/suscripciones/{empresaId}?nivel=PREMIUM&duracion=15", 50)
               .contentType(MediaType.APPLICATION_JSON))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(2))
               .andExpect(jsonPath("$.nivel").value("PREMIUM"))
               .andExpect(jsonPath("$.activa").value(true));
    }
     @Test
    void testObtenerSuscripcionActiva_NoEncontrada() throws Exception {
        // Lanza ResourceNotFoundException => 404
        doThrow(new ResourceNotFoundException("Suscripcion","empresaId",999))
            .when(suscripcionService).obtenerSuscripcionActiva(999);

        mockMvc.perform(get("/suscripciones/activa/{empresaId}", 999))
               .andExpect(status().isNotFound());
    }

    @Test
    void testDesactivarSuscripcion_NoEncontrada() throws Exception {
        // El service no encuentra la suscripcion ID=777 => optional empty
        when(suscripcionService.buscarPorId(777)).thenReturn(Optional.empty());

        mockMvc.perform(put("/suscripciones/desactivar/{id}", 777))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.message").value("Suscripción no encontrada."));
    }

    @Test
    void testDesactivarSuscripcion_Exito() throws Exception {
        Suscripcion s = new Suscripcion();
        s.setId(5);
        s.setActiva(true);

        when(suscripcionService.buscarPorId(5)).thenReturn(Optional.of(s));
        when(suscripcionService.guardar(any(Suscripcion.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(put("/suscripciones/desactivar/{id}", 5))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Suscripción desactivada con éxito."));
    }
}
