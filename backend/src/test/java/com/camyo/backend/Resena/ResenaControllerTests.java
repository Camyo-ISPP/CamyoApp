package com.camyo.backend.Resena;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaEstado;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.resena.Resena;
import com.camyo.backend.resena.ResenaController;
import com.camyo.backend.resena.ResenaService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ResenaController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ResenaControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ResenaService resenaService;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private OfertaService ofertaService;

    private Usuario comentador;
    private Usuario comentado;
    private Resena resena;

    @BeforeEach
    void setUp() {
        comentador = new Usuario();
        comentador.setId(1);
        Authorities auth1 = new Authorities();
        auth1.setAuthority("CAMIONERO");
        comentador.setAuthority(auth1);

        comentado = new Usuario();
        comentado.setId(2);
        Authorities auth2 = new Authorities();
        auth2.setAuthority("EMPRESA");
        comentado.setAuthority(auth2);

        resena = new Resena();
        resena.setId(1);
        resena.setValoracion(5);
        resena.setComentador(comentador);
        resena.setComentado(comentado);
    }

    @Test
    void obtenerTodasResenasComentadoTest() throws Exception {
        when(resenaService.obtenerTodasResenasComentadoPorId(2)).thenReturn(List.of(resena));
        mockMvc.perform(get("/resenas/comentado/2"))
               .andExpect(status().isOk());
    }

    @Test
    void obtenerTodasResenasComentadorTest() throws Exception {
        when(resenaService.obtenerTodasResenasComentadorPorId(1)).thenReturn(List.of(resena));
        mockMvc.perform(get("/resenas/comentador/1"))
               .andExpect(status().isOk());
    }

    @Test
    void obtenerResenaPorIdTest() throws Exception {
        when(resenaService.obtenerResena(1)).thenReturn(resena);
        mockMvc.perform(get("/resenas/1"))
               .andExpect(status().isOk());
    }

    @Test
    void eliminarResenaTest() throws Exception {
        when(resenaService.obtenerResena(1)).thenReturn(resena);
        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);
        doNothing().when(resenaService).eliminarResena(1);
        mockMvc.perform(delete("/resenas/1"))
               .andExpect(status().isNoContent());
    }

    @Test
    void eliminarResenaNoAutorizadoTest() throws Exception {
        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(99);
        when(resenaService.obtenerResena(1)).thenReturn(resena);
        when(usuarioService.obtenerUsuarioActual()).thenReturn(otroUsuario);
        mockMvc.perform(delete("/resenas/1"))
               .andExpect(status().isForbidden());
    }

    @Test
    void actualizarResenaTest() throws Exception {
        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);
        when(resenaService.actualizarResena(1, resena)).thenReturn(resena);
        mockMvc.perform(put("/resenas/1")
               .contentType("application/json")
               .content(objectMapper.writeValueAsString(resena)))
               .andExpect(status().isOk());
    }

    @Test
    void actualizarResenaNoAutorizadoTest() throws Exception {
        Usuario otroUsuario = new Usuario();
        otroUsuario.setId(99);
        when(usuarioService.obtenerUsuarioActual()).thenReturn(otroUsuario);
        mockMvc.perform(put("/resenas/1")
               .contentType("application/json")
               .content(objectMapper.writeValueAsString(resena)))
               .andExpect(status().isForbidden());
    }

    @Test
    void obtenerUsuariosResenadosPorUsuarioTest() throws Exception {
        when(resenaService.obtenerTodasResenasComentadorPorId(1)).thenReturn(List.of(resena));
        mockMvc.perform(get("/resenas/resenados/1"))
               .andExpect(status().isOk());
    }

    @Test
    void crearResenaNoValidaTest() throws Exception {
        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);
        when(ofertaService.obtenerOfertasPorCamionero(1)).thenReturn(List.of());
        when(ofertaService.obtenerOfertasPorEmpresa(2)).thenReturn(List.of());

        mockMvc.perform(post("/resenas")
               .contentType("application/json")
               .content(objectMapper.writeValueAsString(resena)))
               .andExpect(status().isBadRequest());
    }

    @Test
    void crearResenaValidaComoCamioneroRetorna201() throws Exception {
        Authorities rolCamionero = new Authorities();
        rolCamionero.setAuthority("CAMIONERO");
        comentador.setAuthority(rolCamionero);
        Oferta ofertaCerrada = new Oferta();
        ofertaCerrada.setEstado(OfertaEstado.CERRADA);
        ofertaCerrada.setCamionero(new Camionero());
        ofertaCerrada.getCamionero().setUsuario(comentador);
        ofertaCerrada.setEmpresa(new Empresa());
        ofertaCerrada.getEmpresa().setUsuario(comentado);

        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);
        when(usuarioService.obtenerCamioneroIdPorUsuarioId(comentador.getId())).thenReturn(10);
        when(ofertaService.obtenerOfertasPorCamionero(10))
            .thenReturn(List.of(List.of(), List.of(), List.of(ofertaCerrada))); 
        when(usuarioService.obtenerEmpresaIdPorUsuarioId(comentado.getId())).thenReturn(200);
        when(ofertaService.obtenerOfertasPorEmpresa(200)).thenReturn(List.of(ofertaCerrada));
        when(resenaService.crearResena(any(Resena.class))).thenReturn(resena);

        mockMvc.perform(post("/resenas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resena)))
            .andExpect(status().isCreated());
    }

    @Test
    void crearResenaInvalidaComoCamioneroRetorna400() throws Exception {
        Authorities rolCamionero = new Authorities();
        rolCamionero.setAuthority("CAMIONERO");
        comentador.setAuthority(rolCamionero);

        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);
        when(usuarioService.obtenerCamioneroIdPorUsuarioId(comentador.getId())).thenReturn(10);
        when(ofertaService.obtenerOfertasPorCamionero(10))
            .thenReturn(List.of(List.of(), List.of(), List.of())); 
        when(usuarioService.obtenerEmpresaIdPorUsuarioId(comentado.getId())).thenReturn(200);
        when(ofertaService.obtenerOfertasPorEmpresa(200)).thenReturn(List.of());

        mockMvc.perform(post("/resenas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resena)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void crearResenaValidaComoEmpresaRetorna201() throws Exception {
        Authorities rolEmpresa = new Authorities();
        rolEmpresa.setAuthority("EMPRESA");
        comentador.setAuthority(rolEmpresa);
        Oferta ofertaCerrada = new Oferta();
        ofertaCerrada.setEstado(OfertaEstado.CERRADA);
        ofertaCerrada.setCamionero(new Camionero());
        ofertaCerrada.getCamionero().setUsuario(comentado);
        ofertaCerrada.setEmpresa(new Empresa());
        ofertaCerrada.getEmpresa().setUsuario(comentador);

        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);
        when(usuarioService.obtenerCamioneroIdPorUsuarioId(comentado.getId())).thenReturn(33);
        when(ofertaService.obtenerOfertasPorCamionero(33))
            .thenReturn(List.of(List.of(), List.of(), List.of(ofertaCerrada)));
        when(usuarioService.obtenerEmpresaIdPorUsuarioId(comentador.getId())).thenReturn(88);
        when(ofertaService.obtenerOfertasPorEmpresa(88)).thenReturn(List.of(ofertaCerrada));
        when(resenaService.crearResena(any(Resena.class))).thenReturn(resena);

        mockMvc.perform(post("/resenas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resena)))
            .andExpect(status().isCreated());
    }

    @Test
    void crearResenaInvalidaComoEmpresaRetorna400() throws Exception {
        Authorities rolEmpresa = new Authorities();
        rolEmpresa.setAuthority("EMPRESA");
        comentador.setAuthority(rolEmpresa);

    
        when(usuarioService.obtenerUsuarioActual()).thenReturn(comentador);
        when(usuarioService.obtenerCamioneroIdPorUsuarioId(comentado.getId())).thenReturn(66);
        when(ofertaService.obtenerOfertasPorCamionero(66))
            .thenReturn(List.of(List.of(), List.of(), List.of()));
        when(usuarioService.obtenerEmpresaIdPorUsuarioId(comentador.getId())).thenReturn(88);
        when(ofertaService.obtenerOfertasPorEmpresa(88)).thenReturn(List.of());

        mockMvc.perform(post("/resenas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resena)))
            .andExpect(status().isBadRequest());
    }

}