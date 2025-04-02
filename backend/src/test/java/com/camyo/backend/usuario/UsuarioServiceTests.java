package com.camyo.backend.usuario;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.resena.Resena;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UsuarioServiceTests {

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private UsuarioService usuarioService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Test
    void testGuardarUsuario_Exito() {
        Usuario nuevo = new Usuario();
        nuevo.setPassword("plainPass");
    
        Usuario guardado = new Usuario();
        guardado.setId(1);
        guardado.setPassword("encodedPass");
    
        when(encoder.encode("plainPass")).thenReturn("encodedPass");
        // en vez de save(nuevo), pones save(any(Usuario.class))
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            // Obtenemos la instancia real que se pasa a 'save(...)'
            Usuario param = invocation.getArgument(0);
        
            // Le asignamos el ID directamente
            param.setId(1);
            param.setPassword("encodedPass");  // si quieres, también
        
            // Retornamos esa misma instancia
            return param;
        });

    
        Usuario result = usuarioService.guardarUsuario(nuevo);
    
        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("encodedPass", result.getPassword());
    }
    
    
    @Test
    void testObtenerUsuarioPorId_NoEncontrado() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> usuarioService.obtenerUsuarioPorId(99));
    }

    @Test
    void testObtenerValoracionMedia_ConResenas() {
        List<Resena> reseñas = new ArrayList<>();
        Resena r1 = new Resena(); r1.setValoracion(4);
        Resena r2 = new Resena(); r2.setValoracion(2);
        reseñas.add(r1);
        reseñas.add(r2);

        when(usuarioRepository.obtenerReseñas(5)).thenReturn(reseñas);

        Float valor = usuarioService.obtenerValoracionMedia(5);
        assertEquals(3.0f, valor);
    }
    @Test
    void testUpdateUser_EmailExistente() {
        // Ya hay un usuario con ID=10, email="old@mail.com"
        Usuario existente = new Usuario();
        existente.setId(10);
        existente.setEmail("old@mail.com");

        when(usuarioRepository.findById(10)).thenReturn(Optional.of(existente));
        
        // Nuevo email "taken@mail.com" => el repositorio dice que ya existe
        when(usuarioRepository.existsByEmail("taken@mail.com")).thenReturn(true);

        Usuario detalles = new Usuario();
        detalles.setEmail("taken@mail.com");
        detalles.setPassword("newPwd");

        assertThrows(IllegalArgumentException.class,
            () -> usuarioService.updateUser(detalles, 10));
    }

    @Test
    void testUpdateUser_SinNuevoPassword() {
        Usuario existente = new Usuario();
        existente.setId(10);
        existente.setEmail("old@mail.com");
        existente.setPassword("oldEncodedPass");

        when(usuarioRepository.findById(10)).thenReturn(Optional.of(existente));
        when(usuarioRepository.existsByEmail("new@mail.com")).thenReturn(false);

        Usuario detalles = new Usuario();
        detalles.setEmail("new@mail.com");
        // no hay password => no se re-encode

        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario result = usuarioService.updateUser(detalles, 10);
        assertEquals("new@mail.com", result.getEmail());
        // Mantiene la password anterior
        assertEquals("oldEncodedPass", result.getPassword());
    }
}
