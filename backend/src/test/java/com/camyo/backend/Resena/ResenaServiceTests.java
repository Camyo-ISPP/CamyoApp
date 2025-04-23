package com.camyo.backend.Resena;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.resena.Resena;
import com.camyo.backend.resena.ResenaRepository;
import com.camyo.backend.resena.ResenaService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResenaServiceTests {

    @Mock
    private ResenaRepository resenaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ResenaService resenaService;

    private Resena resena;
    private Usuario comentador;
    private Usuario comentado;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        comentador = new Usuario();
        comentador.setId(1);
        comentado = new Usuario();
        comentado.setId(2);

        resena = new Resena();
        resena.setId(100);
        resena.setValoracion(4);
        resena.setComentarios("Muy bien");
        resena.setComentador(comentador);
        resena.setComentado(comentado);
    }

    @Test
    void debeObtenerTodasResenasComentadorPorId() {
        when(resenaRepository.findAllComentadorByUserId(1)).thenReturn(List.of(resena));
        List<Resena> resultado = resenaService.obtenerTodasResenasComentadorPorId(1);
        assertEquals(1, resultado.size());
    }

    @Test
    void debeObtenerTodasResenasComentadoPorId() {
        when(resenaRepository.findAllComentadoByUserId(2)).thenReturn(List.of(resena));
        List<Resena> resultado = resenaService.obtenerTodasResenasComentadoPorId(2);
        assertEquals(1, resultado.size());
    }

    @Test
    void debeObtenerResenaPorId() {
        when(resenaRepository.findById(100)).thenReturn(Optional.of(resena));
        Resena resultado = resenaService.obtenerResena(100);
        assertEquals(resena.getId(), resultado.getId());
    }

    @Test
    void noDebeObtenerResenaPorIdYLanzaExcepcion() {
        when(resenaRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> resenaService.obtenerResena(999));
    }

    @Test
    void debeCrearResena() {
        when(resenaRepository.save(any(Resena.class))).thenReturn(resena);
        Resena resultado = resenaService.crearResena(resena);
        assertNotNull(resultado);
    }

    @Test
    void debeActualizarResena() {
        Resena actualizada = new Resena();
        actualizada.setValoracion(5);
        actualizada.setComentarios("Excelente");
        actualizada.setComentador(comentador);
        actualizada.setComentado(comentado);

        when(resenaRepository.findById(100)).thenReturn(Optional.of(resena));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(comentador));
        when(usuarioRepository.findById(2)).thenReturn(Optional.of(comentado));
        when(resenaRepository.save(any(Resena.class))).thenReturn(resena);

        Resena resultado = resenaService.actualizarResena(100, actualizada);
        assertEquals(5, resultado.getValoracion());
        assertEquals("Excelente", resultado.getComentarios());
    }

    @Test
    void noDebeActualizarResenaComentadorNoEncontrado() {
        Resena nueva = new Resena();
        nueva.setComentador(comentador);
        nueva.setComentado(comentado);

        when(resenaRepository.findById(100)).thenReturn(Optional.of(resena));
        when(usuarioRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resenaService.actualizarResena(100, nueva));
    }

    @Test
    void noDebeActualizarResenaComentadoNoEncontrado() {
        Resena nueva = new Resena();
        nueva.setComentador(comentador);
        nueva.setComentado(comentado);

        when(resenaRepository.findById(100)).thenReturn(Optional.of(resena));
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(comentador));
        when(usuarioRepository.findById(2)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resenaService.actualizarResena(100, nueva));
    }

    @Test
    void debeEliminarResena() {
        when(resenaRepository.findById(100)).thenReturn(Optional.of(resena));
        doNothing().when(resenaRepository).delete(resena);
        assertDoesNotThrow(() -> resenaService.eliminarResena(100));
    }

    @Test
    void noDebeEliminarResenaYlanzarExcepcion() {
        when(resenaRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> resenaService.eliminarResena(999));
    }
}