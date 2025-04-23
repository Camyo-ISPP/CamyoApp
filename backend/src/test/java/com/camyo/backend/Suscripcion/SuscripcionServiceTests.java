package com.camyo.backend.Suscripcion;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.Suscripcion;
import com.camyo.backend.suscripcion.SuscripcionRepository;
import com.camyo.backend.suscripcion.SuscripcionService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class SuscripcionServiceTests {

    @Mock
    private SuscripcionRepository suscripcionRepository;

    @Mock
    private EmpresaService empresaService;

    @InjectMocks
    private SuscripcionService suscripcionService;

    private Empresa empresa;
    private Suscripcion suscripcionExistente;

    @BeforeEach
    void setUp() {
        empresa = new Empresa();
        empresa.setId(10);

        suscripcionExistente = new Suscripcion();
        suscripcionExistente.setId(1);
        suscripcionExistente.setEmpresa(empresa);
        suscripcionExistente.setNivel(PlanNivel.GRATIS);
        suscripcionExistente.setFechaInicio(LocalDate.now().minusDays(5));
        suscripcionExistente.setFechaFin(null);
        suscripcionExistente.setActiva(true);
    }

    @Test
    void testAsignarSuscripcion_CreaNuevaGratis() {
        // Aquí SÍ necesitamos 'save'
        when(suscripcionRepository.save(any(Suscripcion.class)))
            .thenAnswer(invocation -> {
                Suscripcion sus = invocation.getArgument(0);
                sus.setId(999);
                return sus;
            });

        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findAnyByEmpresa(empresa)).thenReturn(Optional.empty());

        Suscripcion result = suscripcionService.asignarSuscripcion(empresa.getId(), PlanNivel.GRATIS, null);

        assertNotNull(result);
        assertEquals(PlanNivel.GRATIS, result.getNivel());
        assertNull(result.getFechaFin());
        assertTrue(result.getActiva());
        verify(suscripcionRepository).save(any(Suscripcion.class));
    }

    @Test
    void testAsignarSuscripcion_CreaNuevaBasico_SinDuracion() {
        // También se llama a save
        when(suscripcionRepository.save(any(Suscripcion.class)))
            .thenAnswer(invocation -> {
                Suscripcion sus = invocation.getArgument(0);
                sus.setId(999);
                return sus;
            });

        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findAnyByEmpresa(empresa)).thenReturn(Optional.empty());

        Suscripcion result = suscripcionService.asignarSuscripcion(empresa.getId(), PlanNivel.BASICO, null);

        assertNotNull(result);
        assertEquals(PlanNivel.BASICO, result.getNivel());
        assertEquals(LocalDate.now(), result.getFechaInicio());
        assertEquals(LocalDate.now().plusDays(30), result.getFechaFin());
        assertTrue(result.getActiva());
    }

    @Test
    void testAsignarSuscripcion_UsaSuscripcionExistente() {
        // Igualmente save
        when(suscripcionRepository.save(any(Suscripcion.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findAnyByEmpresa(empresa)).thenReturn(Optional.of(suscripcionExistente));

        Suscripcion result = suscripcionService.asignarSuscripcion(empresa.getId(), PlanNivel.PREMIUM, 15);

        assertNotNull(result);
        assertEquals(PlanNivel.PREMIUM, result.getNivel());
        assertEquals(LocalDate.now(), result.getFechaInicio());
        assertEquals(LocalDate.now().plusDays(15), result.getFechaFin());
        assertTrue(result.getActiva());
        verify(suscripcionRepository).save(suscripcionExistente);
    }

    @Test
    void testObtenerSuscripcionActiva_Exito() {
        // No se llama a 'save' (a menos que caduque). 
        // Por tanto, no configuramos 'save' => sin stubbing innecesario
        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findByEmpresaAndActivaTrue(empresa))
                .thenReturn(Optional.of(suscripcionExistente));

        Suscripcion result = suscripcionService.obtenerSuscripcionActiva(empresa.getId());

        assertNotNull(result);
        assertEquals(suscripcionExistente.getId(), result.getId());
        assertTrue(result.getActiva());
        // No hay verify(suscripcionRepository.save(...)), no se invoca
    }

    @Test
    void testObtenerSuscripcionActiva_NoExiste() {
        // Tampoco llama a 'save'
        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findByEmpresaAndActivaTrue(empresa)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> suscripcionService.obtenerSuscripcionActiva(empresa.getId()));
    }

    @Test
    void testObtenerSuscripcionActiva_Caducada() {
        // Aquí sí se llama a save, porque la suscripción ha caducado y la desactiva
        suscripcionExistente.setFechaFin(LocalDate.now().minusDays(1));
        suscripcionExistente.setNivel(PlanNivel.BASICO);

        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findByEmpresaAndActivaTrue(empresa))
                .thenReturn(Optional.of(suscripcionExistente));

        // Stub de save
        when(suscripcionRepository.save(any(Suscripcion.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
            () -> suscripcionService.obtenerSuscripcionActiva(empresa.getId()));

        assertTrue(ex.getMessage().contains("caducada"));
        assertFalse(suscripcionExistente.getActiva());
        verify(suscripcionRepository).save(suscripcionExistente);
    }

    @Test
    void testObtenerNivelSuscripcion_Activa() {
        // No llama a save
        suscripcionExistente.setNivel(PlanNivel.BASICO);
        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findByEmpresaAndActivaTrue(empresa))
                .thenReturn(Optional.of(suscripcionExistente));

        PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(empresa.getId());
        assertEquals(PlanNivel.BASICO, nivel);
    }

    @Test
    void testObtenerNivelSuscripcion_NoActiva() {
        // No llama a save
        when(empresaService.obtenerEmpresaPorId(empresa.getId())).thenReturn(empresa);
        when(suscripcionRepository.findByEmpresaAndActivaTrue(empresa)).thenReturn(Optional.empty());

        PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(empresa.getId());
        assertEquals(PlanNivel.GRATIS, nivel);
    }

    @Test
    void testBuscarPorId() {
        // No llama a save
        when(suscripcionRepository.findById(99)).thenReturn(Optional.of(suscripcionExistente));
        Optional<Suscripcion> result = suscripcionService.buscarPorId(99);

        assertTrue(result.isPresent());
        assertEquals(suscripcionExistente.getId(), result.get().getId());
    }

    @Test
    void testGuardar() {
        // Aquí sí llama a save
        when(suscripcionRepository.save(any(Suscripcion.class)))
            .thenAnswer(invocation -> {
                Suscripcion s = invocation.getArgument(0);
                s.setId(999);
                return s;
            });

        Suscripcion aGuardar = new Suscripcion();
        aGuardar.setNivel(PlanNivel.BASICO);
        aGuardar.setFechaInicio(LocalDate.now());
        aGuardar.setEmpresa(empresa);

        Suscripcion result = suscripcionService.guardar(aGuardar);
        assertNotNull(result);
        assertEquals(999, result.getId());
        verify(suscripcionRepository).save(aGuardar);
    }
}
