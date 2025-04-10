package com.camyo.backend.Usuario;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioController;
import com.camyo.backend.usuario.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class UsuarioControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private EmpresaService empresaService;

    @MockitoBean
    private CamioneroService camioneroService;

    @MockitoBean
    private OfertaService ofertaService;

    private Usuario userActual;
    private Usuario userEliminar;

    @BeforeEach
    void setUp() {
        userActual = new Usuario();
        userActual.setId(100);
        Authorities rolAdmin = new Authorities();
        rolAdmin.setAuthority("ADMIN");
        userActual.setAuthority(rolAdmin);

        userEliminar = new Usuario();
        userEliminar.setId(1);
        Authorities rolDefault = new Authorities();
        rolDefault.setAuthority("CAMIONERO");
        userEliminar.setAuthority(rolDefault);
    }

    @Test
    void noLogueadoDebeRetornar403() throws Exception {
        when(usuarioService.obtenerUsuarioActual()).thenThrow(new ResourceNotFoundException("Nobody authenticated!"));
        mockMvc.perform(delete("/usuarios/1"))
               .andExpect(status().isForbidden())
               .andExpect(result -> result.getResponse().getContentAsString().contains("Debe iniciar sesión"));
    }

    @Test
    void usuarioNoEncontradoRetorna404() throws Exception {
        when(usuarioService.obtenerUsuarioActual()).thenReturn(userActual);
        when(usuarioService.obtenerUsuarioPorId(999))
            .thenThrow(new ResourceNotFoundException("Usuario", "id", 999));
        mockMvc.perform(delete("/usuarios/999"))
               .andExpect(status().isNotFound())
               .andExpect(result -> result.getResponse().getContentAsString().contains("Usuario no encontrado"));
    }

    @Test
    void noEsAdminNiElMismoRetorna403() throws Exception {
        Usuario noAdmin = new Usuario();
        noAdmin.setId(10);
        Authorities camRole = new Authorities();
        camRole.setAuthority("CAMIONERO");
        noAdmin.setAuthority(camRole);
        when(usuarioService.obtenerUsuarioActual()).thenReturn(noAdmin);
        when(usuarioService.obtenerUsuarioPorId(1)).thenReturn(userEliminar);
        mockMvc.perform(delete("/usuarios/1"))
               .andExpect(status().isForbidden())
               .andExpect(result -> result.getResponse().getContentAsString()
                   .contains("Sólo un administrador puede eliminar cuentas ajenas."));
    }

    @Test
    void usuarioEsEmpresaEliminadoOk() throws Exception {
        userEliminar.getAuthority().setAuthority("EMPRESA");
        Empresa emp = new Empresa();
        emp.setId(300);
        when(usuarioService.obtenerUsuarioActual()).thenReturn(userActual);
        when(usuarioService.obtenerUsuarioPorId(1)).thenReturn(userEliminar);
        when(empresaService.obtenerEmpresaPorUsuario(1)).thenReturn(Optional.of(emp));
        doNothing().when(empresaService).eliminarEmpresa(300);
        doNothing().when(usuarioService).eliminarUsuario(1);
        mockMvc.perform(delete("/usuarios/1"))
               .andExpect(status().isOk())
               .andExpect(result -> result.getResponse().getContentAsString()
                   .contains("Usuario eliminado con éxito!"));
    }

    @Test
    void usuarioEsCamioneroEliminadoOk() throws Exception {
        when(usuarioService.obtenerUsuarioActual()).thenReturn(userActual);
        when(usuarioService.obtenerUsuarioPorId(1)).thenReturn(userEliminar);
        Camionero cam = new Camionero();
        cam.setId(200);
        when(camioneroService.obtenerCamioneroPorUsuario(1)).thenReturn(cam);
        when(ofertaService.obtenerOfertasPorCamionero(200))
            .thenReturn(List.of(List.of(), List.of()));
        doNothing().when(camioneroService).eliminarCamioneroDeOfertas(eq(cam), anyList(), anyList());
        doNothing().when(camioneroService).eliminarCamionero(200);
        doNothing().when(usuarioService).eliminarUsuario(1);
        mockMvc.perform(delete("/usuarios/1"))
               .andExpect(status().isOk())
               .andExpect(result -> result.getResponse().getContentAsString()
                   .contains("Usuario eliminado con éxito!"));
    }

    @Test
    void usuarioEsElMismoOk() throws Exception {
        userActual.setId(1);
        when(usuarioService.obtenerUsuarioActual()).thenReturn(userActual);
        when(usuarioService.obtenerUsuarioPorId(1)).thenReturn(userEliminar);
        Camionero cam = new Camionero();
        cam.setId(999);
        when(camioneroService.obtenerCamioneroPorUsuario(1)).thenReturn(cam);
        when(ofertaService.obtenerOfertasPorCamionero(999))
            .thenReturn(List.of(List.of(), List.of()));

        doNothing().when(camioneroService).eliminarCamioneroDeOfertas(eq(cam), anyList(), anyList());
        doNothing().when(camioneroService).eliminarCamionero(999);
        doNothing().when(usuarioService).eliminarUsuario(1);

        mockMvc.perform(delete("/usuarios/1"))
            .andExpect(status().isOk())
            .andExpect(result -> 
                result.getResponse().getContentAsString()
                        .contains("Usuario eliminado con éxito!")
            );
    }


    @Test
    void usuarioNuloRetorna404() throws Exception {
        when(usuarioService.obtenerUsuarioActual()).thenReturn(userActual);
        when(usuarioService.obtenerUsuarioPorId(999)).thenReturn(null);
        mockMvc.perform(delete("/usuarios/999"))
               .andExpect(status().isNotFound())
               .andExpect(result -> result.getResponse().getContentAsString()
                   .contains("Usuario no encontrado."));
    }
}
