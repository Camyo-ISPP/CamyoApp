package com.camyo.backend.Oferta;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroRepository;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaRepository;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.CargaRepository;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaRepository;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.oferta.TrabajoRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class OfertaServiceTests {

    @Mock
    private OfertaRepository ofertaRepository;

    @Mock
    private CargaRepository cargaRepository;

    @Mock
    private TrabajoRepository trabajoRepository;

    @Mock
    private CamioneroRepository camioneroRepository;

    @Mock
    private EmpresaRepository empresaRepository;

    @InjectMocks
    private OfertaService ofertaService;

    private Oferta oferta;
    private Camionero camionero;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        Empresa empresa = new Empresa();
        empresa.setId(1);

        oferta = new Oferta();
        oferta.setId(1);
        oferta.setTitulo("Test Oferta");
        oferta.setFechaPublicacion(LocalDateTime.now());
        oferta.setEmpresa(empresa);
        oferta.setAplicados(new HashSet<>());
        oferta.setRechazados(new HashSet<>());

        camionero = new Camionero();
        camionero.setId(1);
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
    void debeAplicarOferta() {
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any(Oferta.class))).thenReturn(oferta);

        Oferta result = ofertaService.aplicarOferta(1, 1);
        assertTrue(result.getAplicados().contains(camionero));
    }

    @Test
    void debeDesaplicarOferta() {
        oferta.getAplicados().add(camionero);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any(Oferta.class))).thenReturn(oferta);

        Oferta result = ofertaService.desaplicarOferta(1, 1);
        assertFalse(result.getAplicados().contains(camionero));
    }

    @Test
    void debeRechazarOferta() {
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any(Oferta.class))).thenReturn(oferta);

        Oferta result = ofertaService.rechazarOferta(1, 1);
        assertTrue(result.getRechazados().contains(camionero));
    }

    @Test
    void debeAsignarOferta() {
        oferta.getAplicados().add(camionero);
        when(ofertaRepository.findById(1)).thenReturn(Optional.of(oferta));
        when(camioneroRepository.findById(1)).thenReturn(Optional.of(camionero));
        when(ofertaRepository.save(any(Oferta.class))).thenReturn(oferta);

        Oferta result = ofertaService.asignarOferta(1, 1);
        assertEquals(camionero, result.getCamionero());
        assertTrue(result.getRechazados().containsAll(oferta.getAplicados()));
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
}
