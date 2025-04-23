package com.camyo.backend.Usuario;

import com.camyo.backend.exceptions.InvalidPhoneNumberException;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.resena.Resena;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;
import com.camyo.backend.usuario.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTests{

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;

    @BeforeEach
    void setup() {
        usuario = new Usuario();
        usuario.setId(1);
        usuario.setNombre("Juan");
        Authorities role = new Authorities();
        role.setAuthority("EMPRESA");
        usuario.setAuthority(role);
        usuario.setPassword("raw");
    }

    @Test
    void debeObtenerUsuarios() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));
        List<Usuario> lista = usuarioService.obtenerUsuarios();
        assertEquals(1, lista.size());
        verify(usuarioRepository).findAll();
    }

    @Test
    void debeObtenerUsuarioPorId() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        Usuario u = usuarioService.obtenerUsuarioPorId(1);
        assertEquals("Juan", u.getNombre());
    }

    @Test
    void noDebeObtenerUsuarioPorIdLanzaExcepcion() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> usuarioService.obtenerUsuarioPorId(99));
    }

    @Test
    void existeUsuarioPorUsernameTrue() {
        when(usuarioRepository.existsByUsername("juanito")).thenReturn(true);
        boolean existe = usuarioService.existeUsuarioPorUsername("juanito");
        assertTrue(existe);
    }

    @Test
    void existeUsuarioPorEmailFalse() {
        when(usuarioRepository.existsByEmail("test@example.com")).thenReturn(false);
        boolean existe = usuarioService.existeUsuarioPorEmail("test@example.com");
        assertFalse(existe);
    }

    @Test
    void debeObtenerUsuarioActualCorrectamente() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getName()).thenReturn("Juanito");
        SecurityContext mockContext = mock(SecurityContext.class);
        when(mockContext.getAuthentication()).thenReturn(mockAuth);

        try (MockedStatic<SecurityContextHolder> mocked = mockStatic(SecurityContextHolder.class)) {
            mocked.when(SecurityContextHolder::getContext).thenReturn(mockContext);

            when(usuarioRepository.findByUsername("Juanito")).thenReturn(Optional.of(usuario));
            Usuario actual = usuarioService.obtenerUsuarioActual();
            assertEquals("Juan", actual.getNombre());
        }
    }

    @Test
    void noDebeObtenerUsuarioActualSinAuth() {

        SecurityContext mockCtx = mock(SecurityContext.class);
        when(mockCtx.getAuthentication()).thenReturn(null);
    
        try (MockedStatic<SecurityContextHolder> mocked = mockStatic(SecurityContextHolder.class)) {
            mocked.when(SecurityContextHolder::getContext).thenReturn(mockCtx);
    
            assertThrows(ResourceNotFoundException.class,
                () -> usuarioService.obtenerUsuarioActual()
            );
        }
    }
    

    @Test
    void noDebeObtenerUsuarioActualNoEncontrado() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getName()).thenReturn("desconocido");

        SecurityContext mockContext = mock(SecurityContext.class);
        when(mockContext.getAuthentication()).thenReturn(mockAuth);

        try (MockedStatic<SecurityContextHolder> mocked = mockStatic(SecurityContextHolder.class)) {
            mocked.when(SecurityContextHolder::getContext).thenReturn(mockContext);

            when(usuarioRepository.findByUsername("desconocido")).thenReturn(Optional.empty());
            assertThrows(ResourceNotFoundException.class, () -> usuarioService.obtenerUsuarioActual());
        }
    }

    @Test
    void debeGuardarUsuario() throws DataAccessException, InvalidPhoneNumberException {
        when(passwordEncoder.encode("raw")).thenReturn("encpass");
        when(usuarioRepository.save(any())).thenReturn(usuario);

        usuario.setPassword("raw");
        usuario.setTelefono("666666666");
        Usuario guardado = usuarioService.guardarUsuario(usuario);
        assertEquals("encpass", guardado.getPassword());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void debeGuardarUsuarioSinEncode() throws DataAccessException, InvalidPhoneNumberException {
        when(usuarioRepository.save(any())).thenReturn(usuario);
        usuario.setPassword("plaintext");
        usuario.setTelefono("666666667");
        Usuario guardado = usuarioService.guardarUsuarioSinEncode(usuario);
        assertEquals("plaintext", guardado.getPassword());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void debeEliminarUsuario() {
        when(usuarioRepository.findById(1)).thenReturn(Optional.of(usuario));
        doNothing().when(usuarioRepository).delete(usuario);

        usuarioService.eliminarUsuario(1);
        verify(usuarioRepository).delete(usuario);
    }

    @Test
    void noDebeEliminarUsuarioNoEncontrado() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> usuarioService.eliminarUsuario(99));
    }

    @Test
    void debeObtenerValoracionMedia() {
        Resena r1 = new Resena();
        r1.setValoracion(4);
        Resena r2 = new Resena();
        r2.setValoracion(2);

        when(usuarioRepository.obtenerReseñas(1)).thenReturn(List.of(r1, r2));
        Float media = usuarioService.obtenerValoracionMedia(1);
        assertEquals(3.0f, media);
    }

    @Test
    void debeRetornarCeroSiNoHayResenas() {
        when(usuarioRepository.obtenerReseñas(1)).thenReturn(List.of());
        Float media = usuarioService.obtenerValoracionMedia(1);
        assertEquals(0.0f, media);
    }

    @Test
    void debeObtenerCamioneroIdPorUsuarioId() {
        when(usuarioRepository.findCamioneroIdByUsuarioId(1)).thenReturn(Optional.of(77));
        Integer camId = usuarioService.obtenerCamioneroIdPorUsuarioId(1);
        assertEquals(77, camId);
    }

    @Test
    void noDebeObtenerCamioneroIdPorUsuarioId() {
        when(usuarioRepository.findCamioneroIdByUsuarioId(99)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> usuarioService.obtenerCamioneroIdPorUsuarioId(99));
    }

    @Test
    void debeObtenerEmpresaIdPorUsuarioId() {
        when(usuarioRepository.findEmpresaIdByUsuarioId(1)).thenReturn(Optional.of(99));
        Integer empId = usuarioService.obtenerEmpresaIdPorUsuarioId(1);
        assertEquals(99, empId);
    }

    @Test
    void noDebeObtenerEmpresaIdPorUsuarioId() {
        when(usuarioRepository.findEmpresaIdByUsuarioId(111)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> usuarioService.obtenerEmpresaIdPorUsuarioId(111));
    }
}