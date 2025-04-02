package com.camyo.backend.suscripcion;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SuscripcionServiceTests {

    @Mock
    private SuscripcionRepository suscripcionRepository;

    @Mock
    private EmpresaService empresaService;

    @InjectMocks
    private SuscripcionService suscripcionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testAsignarSuscripcion_Gratis() {
        Empresa e = new Empresa();
        e.setId(10);

        // la empresa ID=10 existe
        when(empresaService.obtenerEmpresaPorId(10)).thenReturn(e);
        // no hay suscripción previa
        when(suscripcionRepository.findAnyByEmpresa(e)).thenReturn(Optional.empty());

        // simulamos que el repositorio retorna una suscripción con ID=1
        Suscripcion nueva = new Suscripcion();
        nueva.setId(1);
        nueva.setNivel(PlanNivel.GRATIS);
        nueva.setActiva(true);

        when(suscripcionRepository.save(any(Suscripcion.class))).thenReturn(nueva);

        Suscripcion result = suscripcionService.asignarSuscripcion(10, PlanNivel.GRATIS, null);

        assertNotNull(result);
        assertEquals(PlanNivel.GRATIS, result.getNivel());
        assertNull(result.getFechaFin());
    }

    @Test
    void testObtenerSuscripcionActiva_Caducada() {
        Empresa e = new Empresa();
        e.setId(20);

        Suscripcion s = new Suscripcion();
        s.setId(2);
        s.setActiva(true);
        // caducó ayer
        s.setFechaFin(LocalDate.now().minusDays(1));

        when(empresaService.obtenerEmpresaPorId(20)).thenReturn(e);
        when(suscripcionRepository.findByEmpresaAndActivaTrue(e)).thenReturn(Optional.of(s));

        // se lanza ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class,
            () -> suscripcionService.obtenerSuscripcionActiva(20));

        // y se marca inactiva
        verify(suscripcionRepository).save(s);
    }

    @Test
    void testAsignarSuscripcion_Existente() {
        Empresa emp = new Empresa();
        emp.setId(100);

        Suscripcion existente = new Suscripcion();
        existente.setId(10);
        existente.setNivel(PlanNivel.BASIC);

        // la empresa ID=100 existe
        when(empresaService.obtenerEmpresaPorId(100)).thenReturn(emp);
        when(suscripcionRepository.findAnyByEmpresa(emp))
            .thenReturn(Optional.of(existente));

        Suscripcion updated = new Suscripcion();
        updated.setId(10);
        updated.setNivel(PlanNivel.PREMIUM);
        updated.setActiva(true);

        // cuando se hace save(...) se retorna "updated"
        when(suscripcionRepository.save(any(Suscripcion.class))).thenReturn(updated);

        Suscripcion result = suscripcionService.asignarSuscripcion(100, PlanNivel.PREMIUM, 60);

        assertEquals(10, result.getId());
        assertEquals(PlanNivel.PREMIUM, result.getNivel());
    }

    @Test
    void testObtenerNivelSuscripcion_SinActiva() {
        // QUEREMOS que "obtenerSuscripcionActiva(999)" lance ResourceNotFound,
        // para forzar que 'obtenerNivelSuscripcion' retorne GRATIS

        // 1) simulamos empresa con ID=999
        Empresa e = new Empresa();
        e.setId(999);
        when(empresaService.obtenerEmpresaPorId(999)).thenReturn(e);

        // 2) la suscripción no existe => optional empty => en 'obtenerSuscripcionActiva'
        // se lanza ResourceNotFoundException
        when(suscripcionRepository.findByEmpresaAndActivaTrue(e)).thenReturn(Optional.empty());

        // 3) 'obtenerNivelSuscripcion(999)' -> catch => GRATIS
        PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(999);

        assertEquals(PlanNivel.GRATIS, nivel);
    }
}
