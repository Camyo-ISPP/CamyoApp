package com.camyo.backend.Oferta;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.*;
import com.camyo.backend.usuario.Usuario;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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
    Usuario usuarioEmpresa;

    @BeforeAll
    void setup() {
        usuarioEmpresa = new Usuario();
        usuarioEmpresa.setNombre("EmpresaTest");
        usuarioEmpresa.setFoto(new byte[]{10, 20, 30});

        empresa = new Empresa();
        empresa.setId(1);
        empresa.setUsuario(usuarioEmpresa);

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
    void crearOfertaConCargaRetorna201() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nuevaOferta = new Oferta();
        nuevaOferta.setEmpresa(empresa);
        nuevaOferta.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(nuevaOferta);
        Carga nuevaCarga = new Carga();
        nuevaCarga.setMercancia("Electrodomésticos");
        dto.setCarga(nuevaCarga);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(nuevaOferta);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isCreated());
    }

    @Test
    void crearOfertaConTrabajoRetorna201() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nuevaOferta = new Oferta();
        nuevaOferta.setEmpresa(empresa);
        nuevaOferta.setTipoOferta(TipoOferta.TRABAJO);
        dto.setOferta(nuevaOferta);
        Trabajo nuevoTrabajo = new Trabajo();
        nuevoTrabajo.setJornada(Jornada.COMPLETA);
        dto.setTrabajo(nuevoTrabajo);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(nuevaOferta);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isCreated());
    }

    @Test
    void crearOfertaConSueldoNegativoRetorna201() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nuevaOferta = new Oferta();
        nuevaOferta.setEmpresa(empresa);
        nuevaOferta.setTipoOferta(TipoOferta.CARGA);
        nuevaOferta.setTitulo("Oferta con sueldo negativo");
        nuevaOferta.setSueldo(-999.99);
        dto.setOferta(nuevaOferta);
        Carga nuevaCarga = new Carga();
        nuevaCarga.setMercancia("Mercancía X");
        dto.setCarga(nuevaCarga);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(nuevaOferta);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isCreated());
    }

    @Test
    void crearOfertaSinTituloRetorna201() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nuevaOferta = new Oferta();
        nuevaOferta.setEmpresa(empresa);
        nuevaOferta.setTipoOferta(TipoOferta.CARGA);
        nuevaOferta.setTitulo("");
        nuevaOferta.setSueldo(1000.0);
        dto.setOferta(nuevaOferta);
        Carga nuevaCarga = new Carga();
        nuevaCarga.setMercancia("Carga sin título");
        dto.setCarga(nuevaCarga);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(nuevaOferta);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isCreated());
    }

    @Test
    void crearOfertaTipoTrabajoSinObjetoTrabajoRetorna400() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nuevaOferta = new Oferta();
        nuevaOferta.setEmpresa(empresa);
        nuevaOferta.setTipoOferta(TipoOferta.TRABAJO);
        dto.setOferta(nuevaOferta);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isBadRequest());
    }

    @Test
    void crearOfertaEmpresaInexistenteRetorna400() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nuevaOferta = new Oferta();
        nuevaOferta.setEmpresa(empresa);
        nuevaOferta.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(nuevaOferta);
        when(empresaService.obtenerEmpresaPorId(anyInt()))
            .thenThrow(new ResourceNotFoundException("Empresa", "id", 999));
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isBadRequest());
    }

    @Test
    void actualizarOfertaConCargaRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta ofertaExistente = oferta1;
        ofertaExistente.setTipoOferta(TipoOferta.CARGA);
        ofertaExistente.setTitulo("Oferta Nacional - Editada");
        dto.setOferta(ofertaExistente);
        Carga cargaNueva = new Carga();
        cargaNueva.setPeso(555.0);
        dto.setCarga(cargaNueva);
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(ofertaExistente);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(ofertaExistente);
        when(ofertaService.obtenerCarga(1)).thenReturn(new Carga());
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isOk());
    }

    @Test
    void actualizarOfertaConTrabajoRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta ofertaExistente = oferta2;
        ofertaExistente.setTipoOferta(TipoOferta.TRABAJO);
        ofertaExistente.setTitulo("Oferta Internacional - Editada");
        dto.setOferta(ofertaExistente);
        Trabajo trabajoNuevo = new Trabajo();
        trabajoNuevo.setJornada(Jornada.NOCTURNA);
        dto.setTrabajo(trabajoNuevo);
        when(ofertaService.obtenerOfertaPorId(2)).thenReturn(ofertaExistente);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(ofertaExistente);
        when(ofertaService.obtenerTrabajo(2)).thenReturn(new Trabajo());
        mockMvc.perform(put(BASE_URL + "/2")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isOk());
    }

    @Test
    void actualizarOfertaTipoCargaSinObjetoCargaRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta ofertaExistente = oferta1;
        ofertaExistente.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(ofertaExistente);
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(ofertaExistente);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(ofertaExistente);
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isOk());
    }

    @Test
    void actualizarOfertaNoExistenteRetorna404() throws Exception {
        when(ofertaService.obtenerOfertaPorId(999))
            .thenThrow(new ResourceNotFoundException("Oferta", "id", 999));
        OfertaRequestDTO dto = new OfertaRequestDTO();
        mockMvc.perform(put(BASE_URL + "/999")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isNotFound());
    }

    @Test
    void actualizarOfertaErrorInternoRetorna500() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        dto.setOferta(oferta1);
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        doThrow(new RuntimeException("Fallo inesperado")).when(ofertaService).guardarOferta(any(Oferta.class));
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isInternalServerError());
    }

    @Test
    void patrocinarOfertaExcedeLimiteRetorna400() throws Exception {
        doThrow(new RuntimeException("Excede el limite")).when(ofertaService).patrocinarOferta(1);
        mockMvc.perform(put(BASE_URL + "/1/patrocinar"))
           .andExpect(status().isBadRequest());
    }

    @Test
    void obtenerUltimas10OfertasOk() throws Exception {
        when(ofertaService.obtenerUltimas10Ofertas()).thenReturn(List.of(oferta1, oferta2));
        mockMvc.perform(get(BASE_URL + "/recientes"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertasConInformacionCargaOk() throws Exception {
        Oferta ofertaConEmpresa = new Oferta();
        ofertaConEmpresa.setId(10);
        ofertaConEmpresa.setTitulo("Oferta con Carga");
        ofertaConEmpresa.setTipoOferta(TipoOferta.CARGA);
        ofertaConEmpresa.setEstado(OfertaEstado.ABIERTA);
    
        Empresa e = new Empresa();
        Usuario u = new Usuario();
        u.setNombre("EmpresaPrueba");
        e.setUsuario(u);
        ofertaConEmpresa.setEmpresa(e);

        when(ofertaService.obtenerOfertas()).thenReturn(List.of(ofertaConEmpresa));
        Carga c = new Carga();
        c.setMercancia("Mercancía X");
        when(ofertaService.obtenerCarga(anyInt())).thenReturn(c);
    
        mockMvc.perform(get("/ofertas/info"))
               .andExpect(status().isOk());
    }
    

    @Test
    void obtenerOfertasConInformacionTrabajoOk() throws Exception {
        when(ofertaService.obtenerOfertas()).thenReturn(List.of(oferta2));
        when(ofertaService.obtenerTrabajo(anyInt())).thenReturn(trabajo);
        mockMvc.perform(get(BASE_URL + "/info"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertaPorIdOk() throws Exception {
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        mockMvc.perform(get(BASE_URL + "/1"))
           .andExpect(status().isOk());
    }

    @Test
    void noDebeObtenerOfertaPorIdRetorna404() throws Exception {
        when(ofertaService.obtenerOfertaPorId(99)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(get(BASE_URL + "/99"))
           .andExpect(status().isNotFound());
    }

    @Test
    void eliminarOfertaOk() throws Exception {
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        doNothing().when(ofertaService).eliminarOferta(1);
        mockMvc.perform(delete(BASE_URL + "/1"))
           .andExpect(status().isNoContent());
    }

    @Test
    void noDebeEliminarOfertaNoExistenteRetorna404() throws Exception {
        when(ofertaService.obtenerOfertaPorId(99)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(delete(BASE_URL + "/99"))
           .andExpect(status().isNotFound());
    }

    @Test
    void aplicarOfertaOk() throws Exception {
        when(ofertaService.aplicarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/aplicar/1"))
           .andExpect(status().isOk());
    }

    @Test
    void noDebeAplicarOfertaInexistenteRetorna404() throws Exception {
        when(ofertaService.aplicarOferta(1, 1)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(put(BASE_URL + "/1/aplicar/1"))
           .andExpect(status().isNotFound());
    }

    @Test
    void desaplicarOfertaOk() throws Exception {
        when(ofertaService.desaplicarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/desaplicar/1"))
           .andExpect(status().isOk());
    }

    @Test
    void asignarOfertaOk() throws Exception {
        when(ofertaService.asignarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/asignar/1"))
           .andExpect(status().isOk());
    }

    @Test
    void rechazarOfertaOk() throws Exception {
        when(ofertaService.rechazarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/rechazar/1"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerTrabajoDeOfertaOk() throws Exception {
        when(ofertaService.obtenerTrabajo(1)).thenReturn(trabajo);
        mockMvc.perform(get(BASE_URL + "/1/trabajo"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerCargaDeOfertaOk() throws Exception {
        when(ofertaService.obtenerCarga(1)).thenReturn(carga);
        mockMvc.perform(get(BASE_URL + "/1/carga"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertasPorCamioneroOk() throws Exception {
        when(ofertaService.obtenerOfertasPorCamionero(1)).thenReturn(List.of(List.of(oferta1)));
        mockMvc.perform(get(BASE_URL + "/camionero/1"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertasPorEmpresaOk() throws Exception {
        when(ofertaService.obtenerOfertasPorEmpresa(1)).thenReturn(List.of(oferta1));
        mockMvc.perform(get(BASE_URL + "/empresa/1"))
           .andExpect(status().isOk());
    }

    @Test
    void patrocinarOfertaOk() throws Exception {
        when(ofertaService.patrocinarOferta(1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/patrocinar"))
           .andExpect(status().isOk());
    }

    @Test
    void desactivarPatrocinioOk() throws Exception {
        doNothing().when(ofertaService).desactivarPatrocinio(1);
        mockMvc.perform(put(BASE_URL + "/1/desactivar-patrocinio"))
           .andExpect(status().isOk());
    }
}
