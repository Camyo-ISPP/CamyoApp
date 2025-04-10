package com.camyo.backend.Oferta;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.Carga;
import com.camyo.backend.oferta.CargaService;
import com.camyo.backend.oferta.Jornada;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaController;
import com.camyo.backend.oferta.OfertaEstado;
import com.camyo.backend.oferta.OfertaRequestDTO;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.oferta.TipoOferta;
import com.camyo.backend.oferta.Trabajo;
import com.camyo.backend.oferta.TrabajoService;
import com.camyo.backend.usuario.Usuario;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
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
class OfertaControllerTests {

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
        Oferta nueva = new Oferta();
        nueva.setEmpresa(empresa);
        nueva.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(nueva);
        Carga nuevaCarga = new Carga();
        nuevaCarga.setMercancia("Electrodomésticos");
        dto.setCarga(nuevaCarga);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(nueva);
        when(cargaService.guardarCarga(any(Carga.class))).thenReturn(nuevaCarga);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isCreated());
    }

    @Test
    void crearOfertaConTrabajoRetorna201() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nueva = new Oferta();
        nueva.setEmpresa(empresa);
        nueva.setTipoOferta(TipoOferta.TRABAJO);
        dto.setOferta(nueva);
        Trabajo nuevoTrabajo = new Trabajo();
        nuevoTrabajo.setJornada(Jornada.COMPLETA);
        dto.setTrabajo(nuevoTrabajo);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(nueva);
        when(trabajoService.guardarTrabajo(any(Trabajo.class))).thenReturn(nuevoTrabajo);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isCreated());
    }

    @Test
    void crearOfertaCargaSinDatosCargaRetorna400() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta o = new Oferta();
        o.setEmpresa(empresa);
        o.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(o);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isBadRequest());
    }

    @Test
    void crearOfertaTrabajoSinDatosTrabajoRetorna400() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta o = new Oferta();
        o.setEmpresa(empresa);
        o.setTipoOferta(TipoOferta.TRABAJO);
        dto.setOferta(o);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isBadRequest());
    }

    @Test
    void crearOfertaTipoInvalidoRetorna400() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nueva = new Oferta();
        nueva.setEmpresa(empresa);
        dto.setOferta(nueva);
        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isBadRequest());
    }

    @Test
    void crearOfertaEmpresaNoEncontradaRetorna400() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nueva = new Oferta();
        nueva.setEmpresa(empresa);
        nueva.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(nueva);
        when(empresaService.obtenerEmpresaPorId(anyInt()))
            .thenThrow(new ResourceNotFoundException("Empresa", "ID", 1));
        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isBadRequest());
    }

    @Test
    void crearOfertaLanzaErrorInternoRetorna500() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        Oferta nueva = new Oferta();
        nueva.setEmpresa(empresa);
        nueva.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(nueva);
        Carga c = new Carga();
        dto.setCarga(c);

        when(empresaService.obtenerEmpresaPorId(anyInt())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any())).thenThrow(new RuntimeException("Error inesperado"));

        mockMvc.perform(post(BASE_URL)
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
        .andExpect(status().isInternalServerError());
    }

    @Test
    void actualizarOfertaCubreTodosLosIfsRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();

        Oferta nuevaData = new Oferta();
        nuevaData.setEmpresa(empresa);
        nuevaData.setTitulo("Nueva Oferta");
        nuevaData.setLicencia(Licencia.C); 
        nuevaData.setSueldo(1800.0);
        nuevaData.setNotas("Notas de prueba"); 
        nuevaData.setTipoOferta(TipoOferta.TRABAJO);
        dto.setOferta(nuevaData);

        Trabajo t = new Trabajo();
        t.setJornada(Jornada.COMPLETA);
        dto.setTrabajo(t);

        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta2);
        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(ofertaService.guardarOferta(any())).thenReturn(oferta2);
        when(ofertaService.obtenerTrabajo(1)).thenReturn(new Trabajo());
        when(trabajoService.guardarTrabajo(any())).thenReturn(t);

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
        doThrow(new RuntimeException("Fallo inesperado"))
            .when(ofertaService).guardarOferta(any(Oferta.class));
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isInternalServerError());
    }

    @Test
    void actualizarOfertaConCargaRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        oferta1.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(oferta1);
        Carga nuevaCarga = new Carga();
        nuevaCarga.setPeso(555.0);
        dto.setCarga(nuevaCarga);
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(oferta1);
        when(ofertaService.obtenerCarga(1)).thenReturn(new Carga());
        when(cargaService.guardarCarga(any(Carga.class))).thenReturn(nuevaCarga);
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isOk());
    }

    @Test
    void actualizarOfertaConTrabajoRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        oferta2.setTipoOferta(TipoOferta.TRABAJO);
        dto.setOferta(oferta2);
        Trabajo t = new Trabajo();
        t.setJornada(Jornada.NOCTURNA);
        dto.setTrabajo(t);
        when(ofertaService.obtenerOfertaPorId(2)).thenReturn(oferta2);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(oferta2);
        when(ofertaService.obtenerTrabajo(2)).thenReturn(new Trabajo());
        when(trabajoService.guardarTrabajo(any(Trabajo.class))).thenReturn(t);
        mockMvc.perform(put(BASE_URL + "/2")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isOk());
    }

    @Test
    void actualizarOfertaCargaNuevaCuandoNoExisteRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        oferta1.setTipoOferta(TipoOferta.CARGA);
        dto.setOferta(oferta1);
        Carga nuevaCarga = new Carga();
        nuevaCarga.setPeso(888.0);
        dto.setCarga(nuevaCarga);
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(oferta1);
        when(ofertaService.obtenerCarga(1)).thenReturn(null);
        when(cargaService.guardarCarga(any(Carga.class))).thenReturn(nuevaCarga);
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isOk());
    }

    @Test
    void actualizarOfertaTrabajoNuevoCuandoNoExisteRetorna200() throws Exception {
        OfertaRequestDTO dto = new OfertaRequestDTO();
        oferta2.setTipoOferta(TipoOferta.TRABAJO);
        dto.setOferta(oferta2);
        Trabajo nuevoT = new Trabajo();
        nuevoT.setJornada(Jornada.RELEVOS);
        dto.setTrabajo(nuevoT);
        when(ofertaService.obtenerOfertaPorId(2)).thenReturn(oferta2);
        when(ofertaService.guardarOferta(any(Oferta.class))).thenReturn(oferta2);
        when(ofertaService.obtenerTrabajo(2)).thenReturn(null);
        when(trabajoService.guardarTrabajo(any(Trabajo.class))).thenReturn(nuevoT);
        mockMvc.perform(put(BASE_URL + "/2")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isOk());
    }

    @Test
    void actualizarOfertaConEmpresaInexistenteRetorna404() throws Exception {
        Empresa e2 = new Empresa();
        e2.setId(999);
        oferta1.setEmpresa(e2);
        OfertaRequestDTO dto = new OfertaRequestDTO();
        dto.setOferta(oferta1);
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(oferta1);
        when(empresaService.obtenerEmpresaPorId(999))
            .thenThrow(new ResourceNotFoundException("Empresa", "id", 999));
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isNotFound());
    }

    @Test
    void actualizarOfertaTipoInvalidoRetorna500() throws Exception {
        Oferta o = new Oferta();
        o.setTipoOferta(null);
        OfertaRequestDTO dto = new OfertaRequestDTO();
        dto.setOferta(o);
        when(ofertaService.obtenerOfertaPorId(1)).thenReturn(o);
        doThrow(new RuntimeException("Tipo de oferta inválido"))
            .when(ofertaService).guardarOferta(any(Oferta.class));
        mockMvc.perform(put(BASE_URL + "/1")
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(dto)))
           .andExpect(status().isInternalServerError());
    }

    @Test
    void obtenerUltimas10OfertasOk() throws Exception {
        when(ofertaService.obtenerUltimas10Ofertas()).thenReturn(List.of(oferta1, oferta2));
        mockMvc.perform(get(BASE_URL + "/recientes"))
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
    void obtenerOfertasPorCamioneroOk() throws Exception {
        when(ofertaService.obtenerOfertasPorCamionero(1)).thenReturn(List.of(List.of(oferta1)));
        mockMvc.perform(get(BASE_URL + "/camionero/1"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertasPorCamioneroNoExistenteRetorna404() throws Exception {
        when(ofertaService.obtenerOfertasPorCamionero(99))
            .thenThrow(new ResourceNotFoundException("Camionero", "id", 99));
        mockMvc.perform(get(BASE_URL + "/camionero/99"))
           .andExpect(status().isNotFound());
    }

    @Test
    void obtenerOfertasPorEmpresaOk() throws Exception {
        when(ofertaService.obtenerOfertasPorEmpresa(1)).thenReturn(List.of(oferta1));
        mockMvc.perform(get(BASE_URL + "/empresa/1"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertasPorEmpresaNoExistenteRetorna404() throws Exception {
        when(ofertaService.obtenerOfertasPorEmpresa(99))
            .thenThrow(new ResourceNotFoundException("Empresa", "id", 99));
        mockMvc.perform(get(BASE_URL + "/empresa/99"))
           .andExpect(status().isNotFound());
    }

    @Test
    void obtenerOfertasConInformacionCargaOk() throws Exception {
        Oferta o = new Oferta();
        o.setId(10);
        o.setTitulo("Oferta con Carga");
        o.setTipoOferta(TipoOferta.CARGA);
        o.setEstado(OfertaEstado.ABIERTA);
        Empresa e = new Empresa();
        Usuario u = new Usuario();
        u.setNombre("EmpresaPrueba");
        e.setUsuario(u);
        o.setEmpresa(e);
        Carga c = new Carga();
        c.setMercancia("Mercancía X");
        when(ofertaService.obtenerOfertas()).thenReturn(List.of(o));
        when(ofertaService.obtenerCarga(10)).thenReturn(c);
        mockMvc.perform(get(BASE_URL + "/info"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertasConInformacionTrabajoOk() throws Exception {
        oferta2.setEstado(OfertaEstado.ABIERTA);
        when(ofertaService.obtenerOfertas()).thenReturn(List.of(oferta2));
        when(ofertaService.obtenerTrabajo(2)).thenReturn(trabajo);
        mockMvc.perform(get(BASE_URL + "/info"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerOfertasConPromotedNullYEmpresaYUsuarioNoNulos() throws Exception {
    Oferta o = new Oferta();
    o.setId(50);
    o.setTitulo("Oferta sin promoted");
    o.setTipoOferta(TipoOferta.CARGA);
    o.setEstado(OfertaEstado.ABIERTA);
    o.setPromoted(null);

    Empresa empresa = new Empresa();
    Usuario usuario = new Usuario();
    usuario.setNombre("Empresa X");
    usuario.setFoto(new byte[]{});
    empresa.setUsuario(usuario);
    o.setEmpresa(empresa);

    Carga carga = new Carga();
    carga.setMercancia("Arena");

    when(ofertaService.obtenerOfertas()).thenReturn(List.of(o));
    when(ofertaService.obtenerCarga(50)).thenReturn(carga);

    mockMvc.perform(get(BASE_URL + "/info"))
           .andExpect(status().isOk());
    }

    
    @Test
    void ofertasConInformacionEstadoNoAbiertaSeOmite() throws Exception {
        Oferta cerrada = new Oferta();
        cerrada.setId(99);
        cerrada.setTitulo("Oferta Cerrada");
        cerrada.setTipoOferta(TipoOferta.CARGA);
        cerrada.setEstado(OfertaEstado.CERRADA);
    
        Empresa e = new Empresa();
        Usuario u = new Usuario();
        u.setNombre("Empresa Cerrada");
        u.setFoto(new byte[]{1, 2, 3});
        e.setUsuario(u);
        cerrada.setEmpresa(e);
    
        when(ofertaService.obtenerOfertas()).thenReturn(List.of(cerrada));
        when(ofertaService.obtenerCarga(anyInt())).thenReturn(new Carga()); 
    
        mockMvc.perform(get(BASE_URL + "/info"))
            .andExpect(status().isOk());
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
    void noDebeDesaplicarOfertaInexistenteRetorna404() throws Exception {
        when(ofertaService.desaplicarOferta(1, 1)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(put(BASE_URL + "/1/desaplicar/1"))
           .andExpect(status().isNotFound());
    }

    @Test
    void asignarOfertaOk() throws Exception {
        when(ofertaService.asignarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/asignar/1"))
           .andExpect(status().isOk());
    }

    @Test
    void asignarOfertaNoExistenteRetorna404() throws Exception {
        when(ofertaService.asignarOferta(1, 1)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(put(BASE_URL + "/1/asignar/1"))
           .andExpect(status().isNotFound());
    }

    @Test
    void rechazarOfertaOk() throws Exception {
        when(ofertaService.rechazarOferta(1, 1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/rechazar/1"))
           .andExpect(status().isOk());
    }

    @Test
    void rechazarOfertaNoExistenteRetorna404() throws Exception {
        when(ofertaService.rechazarOferta(1, 1)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(put(BASE_URL + "/1/rechazar/1"))
           .andExpect(status().isNotFound());
    }

    @Test
    void obtenerTrabajoDeOfertaOk() throws Exception {
        when(ofertaService.obtenerTrabajo(1)).thenReturn(trabajo);
        mockMvc.perform(get(BASE_URL + "/1/trabajo"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerTrabajoDeOfertaNoExistenteRetorna404() throws Exception {
        when(ofertaService.obtenerTrabajo(99)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(get(BASE_URL + "/99/trabajo"))
           .andExpect(status().isNotFound());
    }

    @Test
    void obtenerCargaDeOfertaOk() throws Exception {
        when(ofertaService.obtenerCarga(1)).thenReturn(carga);
        mockMvc.perform(get(BASE_URL + "/1/carga"))
           .andExpect(status().isOk());
    }

    @Test
    void obtenerCargaDeOfertaNoExistenteRetorna404() throws Exception {
        when(ofertaService.obtenerCarga(99)).thenThrow(ResourceNotFoundException.class);
        mockMvc.perform(get(BASE_URL + "/99/carga"))
           .andExpect(status().isNotFound());
    }

    @Test
    void patrocinarOfertaOk() throws Exception {
        when(ofertaService.patrocinarOferta(1)).thenReturn(oferta1);
        mockMvc.perform(put(BASE_URL + "/1/patrocinar"))
           .andExpect(status().isOk());
    }

    @Test
    void patrocinarOfertaExcedeLimiteRetorna400() throws Exception {
        doThrow(new RuntimeException("Excede el limite")).when(ofertaService).patrocinarOferta(1);
        mockMvc.perform(put(BASE_URL + "/1/patrocinar"))
           .andExpect(status().isBadRequest());
    }

    @Test
    void patrocinarOfertaNoExistenteRetorna400() throws Exception {
        doThrow(new ResourceNotFoundException("Oferta", "id", 99))
            .when(ofertaService).patrocinarOferta(99);
        mockMvc.perform(put(BASE_URL + "/99/patrocinar"))
           .andExpect(status().isBadRequest());
    }

    @Test
    void desactivarPatrocinioOk() throws Exception {
        doNothing().when(ofertaService).desactivarPatrocinio(1);
        mockMvc.perform(put(BASE_URL + "/1/desactivar-patrocinio"))
           .andExpect(status().isOk());
    }

    @Test
    void desactivarPatrocinioNoExistenteRetorna400() throws Exception {
        doThrow(new ResourceNotFoundException("Oferta", "id", 99))
            .when(ofertaService).desactivarPatrocinio(99);
        mockMvc.perform(put(BASE_URL + "/99/desactivar-patrocinio"))
           .andExpect(status().isBadRequest());
    }
}
