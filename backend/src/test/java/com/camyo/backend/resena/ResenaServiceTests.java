package com.camyo.backend.resena;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResenaServiceTests {

    @Mock
    private ResenaRepository resenaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ResenaService resenaService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCrearResena_Exito() {
        Resena nueva = new Resena();
        nueva.setValoracion(5);

        Resena guardada = new Resena();
        guardada.setId(1);
        guardada.setValoracion(5);

        when(resenaRepository.save(nueva)).thenReturn(guardada);

        Resena result = resenaService.crearResena(nueva);
        assertNotNull(result);
        assertEquals(1, result.getId());
    }

    @Test
    void testObtenerResena_NoEncontrada() {
        when(resenaRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
            () -> resenaService.obtenerResena(99));
    }
    @Test
    void testActualizarResena_NoComentadorExiste() {
        // Reseña ID=1 existe
        Resena existente = new Resena();
        existente.setId(1);

        when(resenaRepository.findById(1)).thenReturn(Optional.of(existente));

        Resena detalles = new Resena();
        detalles.setValoracion(3);

        // El "comentador" del JSON no existe
        Usuario noEncontrado = new Usuario();
        noEncontrado.setId(999);
        detalles.setComentador(noEncontrado);

        when(usuarioRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> resenaService.actualizarResena(1, detalles));
    }

    @Test
    void testActualizarResena_NoComentadoExiste() {
        Resena existente = new Resena();
        existente.setId(1);
        when(resenaRepository.findById(1)).thenReturn(Optional.of(existente));

        Resena detalles = new Resena();
        detalles.setValoracion(3);

        Usuario comentador = new Usuario();
        comentador.setId(2);
        detalles.setComentador(comentador);

        // comentado ID=999 no existe
        Usuario comentado = new Usuario();
        comentado.setId(999);
        detalles.setComentado(comentado);

        when(usuarioRepository.findById(2)).thenReturn(Optional.of(comentador));
        when(usuarioRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> resenaService.actualizarResena(1, detalles));
    }

    @Test
    void testObtenerTodasResenasComentadorPorId_Exito() {
        // Retornará una lista con un par de reseñas
        Resena r1 = new Resena(); r1.setId(1);
        Resena r2 = new Resena(); r2.setId(2);

        when(resenaRepository.findAllComentadorByUserId(5))
            .thenReturn(Arrays.asList(r1, r2));

        List<Resena> resultado = resenaService.obtenerTodasResenasComentadorPorId(5);
        assertEquals(2, resultado.size());
    }
}
