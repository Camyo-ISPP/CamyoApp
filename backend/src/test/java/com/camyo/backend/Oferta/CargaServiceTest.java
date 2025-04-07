package com.camyo.backend.Oferta;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.camyo.backend.oferta.Carga;
import com.camyo.backend.oferta.CargaRepository;
import com.camyo.backend.oferta.CargaService;


public class CargaServiceTest {

    @Mock
    private CargaRepository cargaRepository;

    @InjectMocks
    private CargaService cargaService;

    private Carga carga;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        carga = new Carga();
        carga.setId(1);
        carga.setMercancia("Electrodomésticos");
        carga.setPeso(1200.0);
        carga.setOrigen("Sevilla");
        carga.setDestino("Madrid");
        carga.setDistancia(500);
        carga.setInicio(LocalDate.now());
        carga.setFinMinimo(LocalDate.now().plusDays(1));
        carga.setFinMaximo(LocalDate.now().plusDays(3));
    }

    @Test
    void debeGuardarCarga() {
        when(cargaRepository.save(carga)).thenReturn(carga);
        Carga resultado = cargaService.guardarCarga(carga);
        assertEquals(carga, resultado);
        verify(cargaRepository, times(1)).save(carga);
    }
}
