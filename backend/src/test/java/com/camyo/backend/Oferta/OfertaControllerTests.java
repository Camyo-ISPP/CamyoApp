package com.camyo.backend.Oferta;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.Carga;
import com.camyo.backend.oferta.CargaService;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaController;
import com.camyo.backend.oferta.OfertaEstado;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.oferta.Trabajo;
import com.camyo.backend.oferta.TrabajoService;
import com.camyo.backend.oferta.TipoOferta;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.fasterxml.jackson.databind.ObjectMapper;

@ActiveProfiles("test")
@WebMvcTest(value = { OfertaController.class }, properties = {"security.basic.enabled=false"})
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc(addFilters = false)
public class OfertaControllerTests {

    private static final String BASE_URL = "/ofertas";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OfertaService ofertaService;

    @MockitoBean
    private EmpresaService empresaService;

    @MockitoBean
    private CargaService cargaService;

    @MockitoBean
    private TrabajoService trabajoService;

    @Autowired
    private ObjectMapper objectMapper;

    Oferta oferta1;
    Oferta oferta2;
    Empresa empresa;
    Carga carga;
    Trabajo trabajo;

    @BeforeAll
    void setup() {
        empresa = new Empresa();
        empresa.setId(1);

        oferta1 = new Oferta();
        oferta1.setId(1);
        oferta1.setTitulo("Oferta Nacional");
        oferta1.setSueldo(1500.0);
        oferta1.setEmpresa(empresa);
        oferta1.setTipoOferta(TipoOferta.CARGA);
        oferta1.setEstado(OfertaEstado.ABIERTA);

        oferta2 = new Oferta();
        oferta2.setId(2);
        oferta2.setTitulo("Oferta Internacional");
        oferta2.setSueldo(2000.0);
        oferta2.setEmpresa(empresa);
        oferta2.setTipoOferta(TipoOferta.TRABAJO);
        oferta2.setEstado(OfertaEstado.ABIERTA);

        carga = new Carga();
        carga.setId(1);
        carga.setOferta(oferta1);

        trabajo = new Trabajo();
        trabajo.setId(1);
        trabajo.setOferta(oferta2);
    }

    @Test
    void debeObtenerUltimas10Ofertas() throws Exception {
        when(ofertaService.obtenerUltimas10Ofertas()).thenReturn(List.of(oferta1, oferta2));
        mockMvc.perform(get(BASE_URL + "/recientes"))
            .andExpect(status().isOk());
    }

    @Test
    void debeObtenerOfertasConInformacionCarga() throws Exception {
        when(ofertaService.obtenerOfertas()).thenReturn(List.of(oferta1));
        when(ofertaService.obtenerCarga(anyInt())).thenReturn(carga);
        mockMvc.perform(get(BASE_URL + "/info"))
            .andExpect(status().isOk());
    }

    @Test
    void debeObtenerOfertasConInformacionTrabajo() throws Exception {
        when(ofertaService.obtenerOfertas()).thenReturn(List.of(oferta2));
        when(ofertaService.obtenerTrabajo(anyInt())).thenReturn(trabajo);
        mockMvc.perform(get(BASE_URL + "/info"))
            .andExpect(status().isOk());
    }

    @Test
    void debeObtenerOfertaPorId() throws Exception {
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        mockMvc.perform(get(BASE_URL + "/1"))
            .andExpect(status().isOk());
    }

    @Test
    void noDebeObtenerOfertaPorId() throws Exception {
        when(ofertaService.obtenerOfertaPorId(99)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(get(BASE_URL + "/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void debeEliminarOferta() throws Exception {
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        doNothing().when(ofertaService).eliminarOferta(1);
        mockMvc.perform(delete(BASE_URL + "/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void noDebeEliminarOfertaNoExistente() throws Exception {
        when(ofertaService.obtenerOfertaPorId(99)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(delete(BASE_URL + "/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void debeAplicarOferta() throws Exception {
        when(ofertaService.aplicarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/aplicar/1"))
            .andExpect(status().isOk());
    }

    @Test
    void noDebeAplicarOfertaInexistente() throws Exception {
        when(ofertaService.aplicarOferta(1, 1)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(put(BASE_URL + "/1/aplicar/1"))
            .andExpect(status().isNotFound());
    }

    @Test
    void debeDesaplicarOferta() throws Exception {
        when(ofertaService.desaplicarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/desaplicar/1"))
            .andExpect(status().isOk());
    }

    @Test
    void debeAsignarOferta() throws Exception {
        when(ofertaService.asignarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/asignar/1"))
            .andExpect(status().isOk());
    }

    @Test
    void debeRechazarOferta() throws Exception {
        when(ofertaService.rechazarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/rechazar/1"))
            .andExpect(status().isOk());
    }

    @Test
    void debeObtenerTrabajoDeOferta() throws Exception {
        when(ofertaService.obtenerTrabajo(1)).thenReturn(trabajo);
        mockMvc.perform(get(BASE_URL + "/1/trabajo"))
            .andExpect(status().isOk());
    }
    @Test
    void debeObtenerCargaDeOferta() throws Exception {
        when(ofertaService.obtenerCarga(1)).thenReturn(carga);
        mockMvc.perform(get(BASE_URL + "/1/carga"))
            .andExpect(status().isOk());
    }
    @Test
    void debeObtenerOfertasPorCamionero() throws Exception {
        when(ofertaService.obtenerOfertasPorCamionero(1)).thenReturn(List.of(List.of(oferta1)));
        mockMvc.perform(get(BASE_URL + "/camionero/1"))
            .andExpect(status().isOk());
    }
    @Test
    void debeObtenerOfertasPorEmpresa() throws Exception {
        when(ofertaService.obtenerOfertasPorEmpresa(1)).thenReturn(List.of(oferta1));
        mockMvc.perform(get(BASE_URL + "/empresa/1"))
            .andExpect(status().isOk());
    }

    @Test
    void debePatrocinarOferta() throws Exception {
        when(ofertaService.patrocinarOferta(1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/patrocinar"))
            .andExpect(status().isOk());
    }    
    @Test
    void debeDesactivarPatrocinio() throws Exception {
        doNothing().when(ofertaService).desactivarPatrocinio(1);
        mockMvc.perform(put(BASE_URL + "/1/desactivar-patrocinio"))
            .andExpect(status().isOk());
    }

}
