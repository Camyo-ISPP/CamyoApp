package com.camyo.backend.Oferta;

import com.camyo.backend.oferta.Trabajo;
import com.camyo.backend.oferta.TrabajoRepository;
import com.camyo.backend.oferta.TrabajoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class TrabajoServiceTests {

    @Mock
    private TrabajoRepository trabajoRepository;

    @InjectMocks
    private TrabajoService trabajoService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void debeGuardarTrabajo() {
        Trabajo trabajo = new Trabajo();
        trabajo.setFechaIncorporacion(LocalDate.now());
        when(trabajoRepository.save(trabajo)).thenReturn(trabajo);

        Trabajo resultado = trabajoService.guardarTrabajo(trabajo);

        assertEquals(trabajo, resultado);
        verify(trabajoRepository, times(1)).save(trabajo);
    }
}