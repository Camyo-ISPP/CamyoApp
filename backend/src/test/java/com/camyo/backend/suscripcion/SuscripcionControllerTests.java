package com.camyo.backend.suscripcion;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.auth.payload.response.MessageResponse;
import com.camyo.backend.empresa.Empresa;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Optional;

@WebMvcTest(
   value = { SuscripcionController.class },
   properties = {"security.BASICO.enabled=false"}
)
@ActiveProfiles("test")
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc(addFilters = false)
class SuscripcionControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SuscripcionService suscripcionService;

    private Suscripcion s1;
    private Empresa e1;

    @BeforeAll
    void setup() {
        e1 = new Empresa();
        e1.setId(50);

        s1 = new Suscripcion();
        s1.setId(99);
        s1.setEmpresa(e1);
        s1.setNivel(PlanNivel.BASICO);
        s1.setActiva(true);
    }

    @Test
    void testAsignarSuscripcion_Exito() throws Exception {
        when(suscripcionService.asignarSuscripcion(50, PlanNivel.BASICO, 30))
            .thenReturn(s1);
    
        // Usamos 'BASICO' en el query param
        mockMvc.perform(post("/suscripciones/{empresaId}?nivel=BASICO&duracion=30", 50))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").value(99))
               .andExpect(jsonPath("$.nivel").value("BASICO"));
    }
    

    @Test
    void testObtenerSuscripcionActiva_NoEncontrada() throws Exception {
        doThrow(new ResourceNotFoundException("Suscripcion","empresaId",999))
            .when(suscripcionService).obtenerSuscripcionActiva(999);

        mockMvc.perform(get("/suscripciones/activa/{empresaId}",999))
               .andExpect(status().isNotFound());
    }

    @Test
    void testDesactivarSuscripcion_NoEncontrada() throws Exception {
        when(suscripcionService.buscarPorId(777))
            .thenReturn(Optional.empty());

        mockMvc.perform(put("/suscripciones/desactivar/{id}",777))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.message").value("Suscripción no encontrada."));
    }

    @Test
    void testDesactivarSuscripcion_Exito() throws Exception {
        when(suscripcionService.buscarPorId(5))
            .thenReturn(Optional.of(s1));

        // sin excepción => se desactiva con éxito
        mockMvc.perform(put("/suscripciones/desactivar/{id}",5))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.message").value("Suscripción desactivada con éxito."));
    }
}
