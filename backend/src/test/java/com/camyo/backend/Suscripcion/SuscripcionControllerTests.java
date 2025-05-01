package com.camyo.backend.Suscripcion;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.Suscripcion;
import com.camyo.backend.suscripcion.SuscripcionController;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.auth.payload.response.MessageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete; // no se usa en este controller
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = SuscripcionController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class SuscripcionControllerTests {

    @MockitoBean
    private SuscripcionService suscripcionService;

    @Autowired
    private MockMvc mockMvc;

    private Suscripcion suscripcionActiva;

    @BeforeEach
    void setUp() {
        suscripcionActiva = new Suscripcion();
        suscripcionActiva.setId(1);
        suscripcionActiva.setNivel(PlanNivel.BASICO);
        suscripcionActiva.setActiva(true);
    }

    @Test
    void testObtenerSuscripcionActiva_OK() throws Exception {
        when(suscripcionService.obtenerSuscripcionActiva(10)).thenReturn(suscripcionActiva);

        mockMvc.perform(get("/suscripciones/activa/10"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1))
               .andExpect(jsonPath("$.nivel").value("BASICO"))
               .andExpect(jsonPath("$.activa").value(true));
    }

    @Test
    void testObtenerSuscripcionActiva_NotFound() throws Exception {
        
        when(suscripcionService.obtenerSuscripcionActiva(99))
                .thenThrow(new ResourceNotFoundException("Suscripcion", "empresaId", 99));

        mockMvc.perform(get("/suscripciones/activa/99"))
               .andExpect(status().isNotFound());
    }

    @Test
    void testAsignarSuscripcion_EmpresaNotFound() throws Exception {
       
        when(suscripcionService.asignarSuscripcion(999, PlanNivel.GRATIS, null))
            .thenThrow(new ResourceNotFoundException("Empresa", "id", 999));

        mockMvc.perform(post("/suscripciones/999")
               .param("nivel", "GRATIS"))
               .andExpect(status().isNotFound());
    }

    @Test
    void testObtenerNivelSuscripcion_OK() throws Exception {
        when(suscripcionService.obtenerNivelSuscripcion(20)).thenReturn(PlanNivel.PREMIUM);
        mockMvc.perform(get("/suscripciones/nivel/20"))
        .andExpect(status().isOk())
        
        .andExpect(content().string("\"PREMIUM\""));;
    }

    @Test
    void testObtenerNivelSuscripcion_EmpresaNotFound() throws Exception {
        
        when(suscripcionService.obtenerNivelSuscripcion(999))
            .thenThrow(new ResourceNotFoundException("Suscripcion", "empresaId", 999));

        mockMvc.perform(get("/suscripciones/nivel/999"))
               .andExpect(status().isNotFound());
    }

    @Test
    void testDesactivarSuscripcion_OK() throws Exception {
        Suscripcion sus = new Suscripcion();
        sus.setId(7);
        sus.setActiva(true);

        when(suscripcionService.buscarPorId(7)).thenReturn(Optional.of(sus));
        when(suscripcionService.guardar(any(Suscripcion.class))).thenReturn(sus);

        mockMvc.perform(put("/suscripciones/desactivar/7"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Suscripción desactivada con éxito."));
    }

    @Test
    void testDesactivarSuscripcion_NotFound() throws Exception {
        when(suscripcionService.buscarPorId(77)).thenReturn(Optional.empty());

        mockMvc.perform(put("/suscripciones/desactivar/77"))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.message").value("Suscripción no encontrada."));
    }
}
