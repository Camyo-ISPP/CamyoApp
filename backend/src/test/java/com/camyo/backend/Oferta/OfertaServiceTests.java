package com.camyo.backend.Oferta;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroRepository;
import com.camyo.backend.configuration.services.UserDetailsImpl;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaRepository;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.Carga;
import com.camyo.backend.oferta.CargaRepository;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaRepository;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.oferta.Trabajo;
import com.camyo.backend.oferta.TrabajoRepository;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class OfertaServiceTests{

    @Mock private OfertaRepository ofertaRepository;
    @Mock private CargaRepository cargaRepository;
    @Mock private TrabajoRepository trabajoRepository;
    @Mock private CamioneroRepository camioneroRepository;
    @Mock private EmpresaRepository empresaRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private SuscripcionService suscripcionService;

    @InjectMocks
    private OfertaService ofertaService;

    private Oferta oferta;
    private Empresa empresa;
    private Camionero camionero;
    private Usuario usuario;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        usuario = new Usuario();
        usuario.setId(10);
        Authorities roleEmpresa = new Authorities();
        roleEmpresa.setAuthority("EMPRESA");
        usuario.setAuthority(roleEmpresa);

        empresa = new Empresa();
        empresa.setId(1);
        empresa.setUsuario(usuario);

        oferta = new Oferta();
        oferta.setId(1);
        oferta.setEmpresa(empresa);
        oferta.setPromoted(false);
        oferta.setAplicados(new HashSet<>());
        oferta.setRechazados(new HashSet<>());

        camionero = new Camionero();
        camionero.setId(1);

        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(userDetails.getId()).thenReturn(10);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(userDetails, null, new ArrayList<>())
        );

        when(usuarioRepository.findById(10)).thenReturn(Optional.of(usuario));
        when(empresaRepository.obtenerPorUsuario(10)).thenReturn(Optional.of(empresa));
    }

    @Test
    void debeObtenerOfertaPorId() {
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        Oferta resultado = ofertaService.obtenerOfertaPorId(1);
        assertEquals(oferta.getId(), resultado.getId());
    }

    @Test
    void noDebeObtenerOfertaPorId() {
        when(ofertaRepository.findById(2)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> ofertaService.obtenerOfertaPorId(2));
    }

    @Test
    void debeGuardarOferta() {
        when(ofertaRepository.save(oferta)).thenReturn(oferta);
        Oferta result = ofertaService.guardarOferta(oferta);
        assertEquals(oferta, result);
    }

    @Test
    void debeEliminarOferta() {
        doNothing().when(ofertaRepository).deleteById(1);
        assertDoesNotThrow(() -> ofertaService.eliminarOferta(1));
    }

    @Test
    void debeAplicarOferta() {
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any())).thenReturn(oferta);
        Oferta result = ofertaService.aplicarOferta(1, 1);
        assertTrue(result.getAplicados().contains(camionero));
    }

    @Test
    void debeDesaplicarOferta() {
        oferta.getAplicados().add(camionero);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any())).thenReturn(oferta);
        Oferta result = ofertaService.desaplicarOferta(1, 1);
        assertFalse(result.getAplicados().contains(camionero));
    }

    @Test
    void debeRechazarOferta() {
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any())).thenReturn(oferta);
        Oferta result = ofertaService.rechazarOferta(1, 1);
        assertTrue(result.getRechazados().contains(camionero));
    }

    @Test
    void debeAsignarOferta() {
        oferta.getAplicados().add(camionero);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any())).thenReturn(oferta);
        Oferta result = ofertaService.asignarOferta(1, 1);
        assertEquals(camionero, result.getCamionero());
        assertTrue(result.getRechazados().containsAll(oferta.getAplicados()));
    }

    @Test
    void debeObtenerOfertasPorEmpresa() {
        when(empresaRepository.findById(1)).thenReturn(Optional.of(empresa));
        when(ofertaRepository.encontrarOfertasPorEmpresa(1)).thenReturn(List.of(oferta));
        List<Oferta> result = ofertaService.obtenerOfertasPorEmpresa(1);
        assertEquals(1, result.size());
    }

    @Test
    void debeObtenerOfertasPorCamionero() {
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.encontrarAplicadas(1)).thenReturn(List.of(oferta));
        when(ofertaRepository.encontrarRechazadas(1)).thenReturn(List.of());
        when(ofertaRepository.encontrarAsignadas(1)).thenReturn(List.of());
        List<List<Oferta>> result = ofertaService.obtenerOfertasPorCamionero(1);
        assertEquals(3, result.size());
    }

    @Test
    void debeObtenerUltimas10Ofertas() {
        when(ofertaRepository.findTopByOrderByFechaPublicacionDesc()).thenReturn(List.of(oferta));
        List<Oferta> result = ofertaService.obtenerUltimas10Ofertas();
        assertEquals(1, result.size());
    }

    @Test
    void debeObtenerCargaYTrabajo() {
        Carga carga = new Carga();
        carga.setId(1);
        Trabajo trabajo = new Trabajo();
        trabajo.setId(1);
        when(ofertaRepository.encontrarCargaPorOferta(1)).thenReturn(carga);
        when(ofertaRepository.encontrarTrabajoPorOferta(1)).thenReturn(trabajo);
        assertEquals(carga, ofertaService.obtenerCarga(1));
        assertEquals(trabajo, ofertaService.obtenerTrabajo(1));
    }

    @Test
    void debeModificarOferta() {
        Oferta modificada = new Oferta();
        modificada.setTitulo("Modificada");
        Empresa empresaNueva = new Empresa();
        empresaNueva.setId(2);
        modificada.setEmpresa(empresaNueva);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(empresaRepository.findById(2)).thenReturn(Optional.of(empresaNueva));
        when(ofertaRepository.save(any())).thenReturn(oferta);
        Oferta result = ofertaService.modificarOferta(modificada, 1);
        assertNotNull(result);
    }

    @Test
    void debeModificarOfertaSinCambiarEmpresa() {
        Oferta modificada = new Oferta();
        modificada.setTitulo("Nueva");
        modificada.setEmpresa(null);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(ofertaRepository.save(any())).thenReturn(oferta);
        Oferta result = ofertaService.modificarOferta(modificada, 1);
        assertNotNull(result);
    }

    @Test
    void debePatrocinarOfertaConPlanGratisYDisponible() {
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(suscripcionService.obtenerNivelSuscripcion(empresa.getId())).thenReturn(PlanNivel.GRATIS);
        when(ofertaRepository.countByEmpresaIdPromotedTrue(empresa.getId())).thenReturn(0);
        when(ofertaRepository.save(any())).thenReturn(oferta);
        Oferta resultado = ofertaService.patrocinarOferta(1);
        assertTrue(resultado.getPromoted());
    }

    @Test
    void noDebePatrocinarOfertaSiYaPromocionada() {
        oferta.setPromoted(true);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> ofertaService.patrocinarOferta(1)
        );
        assertEquals("Esta oferta ya está patrocinada actualmente.", ex.getMessage());
    }

    @Test
    void noDebePatrocinarOfertaSiSinPermiso() {
        Empresa otraEmpresa = new Empresa();
        otraEmpresa.setId(99);
        oferta.setEmpresa(otraEmpresa);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> ofertaService.patrocinarOferta(1)
        );
        assertEquals("No tienes permiso para patrocinar esta oferta.", ex.getMessage());
    }

    @Test
    void noDebePatrocinarOfertaSiSuperaLimiteGratis() {
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(suscripcionService.obtenerNivelSuscripcion(empresa.getId())).thenReturn(PlanNivel.GRATIS);
        when(ofertaRepository.countByEmpresaIdPromotedTrue(empresa.getId())).thenReturn(1);
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> ofertaService.patrocinarOferta(1)
        );
        assertEquals("El plan Gratis solo permite patrocinar 1 oferta.", ex.getMessage());
    }

    @Test
    void debeDesactivarPatrocinioCorrectamente() {
        oferta.setPromoted(true);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(ofertaRepository.save(any())).thenReturn(oferta);
        assertDoesNotThrow(() -> ofertaService.desactivarPatrocinio(1));
        assertFalse(oferta.getPromoted());
    }

    @Test
    void noDebeDesactivarPatrocinioSinPermiso() {
        Empresa otraEmpresa = new Empresa();
        otraEmpresa.setId(99);
        oferta.setEmpresa(otraEmpresa);
        oferta.setPromoted(true);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> ofertaService.desactivarPatrocinio(1)
        );
        assertEquals("No tienes permiso para desactivar esta oferta.", ex.getMessage());
    }

    @Test
    void noDebeDesactivarPatrocinioSiNoEstaActivo() {
        oferta.setPromoted(false);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> ofertaService.desactivarPatrocinio(1)
        );
        assertEquals("Esta oferta no está patrocinada.", ex.getMessage());
    }

    @Test
    void getEmpresaIdFromToken_lanzaExcepcion_siNoHayAuth() {
        SecurityContextHolder.getContext().setAuthentication(null);
        RuntimeException ex = assertThrows(RuntimeException.class,
            this::invokeGetEmpresaIdFromToken
        );
        assertEquals("No hay usuario autenticado", ex.getMessage());
    }

    @Test
    void getEmpresaIdFromToken_lanzaExcepcion_siUsuarioNoExiste() {
        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(userDetails.getId()).thenReturn(999);
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(userDetails, null, new ArrayList<>())
        );
        when(usuarioRepository.findById(999)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            this::invokeGetEmpresaIdFromToken
        );
        assertTrue(ex.getMessage().contains("No existe el usuario"));
    }

    @Test
    void getEmpresaIdFromToken_lanzaExcepcion_siNoEsEmpresa() {
        Authorities role = new Authorities();
        role.setAuthority("CAMIONERO");
        usuario.setAuthority(role);
        when(usuarioRepository.findById(10)).thenReturn(Optional.of(usuario));
        RuntimeException ex = assertThrows(RuntimeException.class,
            this::invokeGetEmpresaIdFromToken
        );
        assertEquals("El usuario autenticado no es una empresa", ex.getMessage());
    }

    @Test
    void getEmpresaIdFromToken_lanzaExcepcion_siNoTieneEmpresa() {
        when(empresaRepository.obtenerPorUsuario(10)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
            this::invokeGetEmpresaIdFromToken
        );
        assertTrue(ex.getMessage().contains("No hay registro de empresa"));
    }

    private Integer invokeGetEmpresaIdFromToken() {
        try {
            Method method = OfertaService.class.getDeclaredMethod("getEmpresaIdFromToken");
            method.setAccessible(true);
            return (Integer) method.invoke(ofertaService);
        } catch (Exception e) {
            throw new RuntimeException(e.getCause().getMessage());
        }
    }
}
