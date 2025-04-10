package com.camyo.backend.Usuario;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesRepository;
import com.camyo.backend.usuario.AuthoritiesService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthoritiesServiceTests {

    @Mock
    private AuthoritiesRepository authoritiesRepository;

    @InjectMocks
    private AuthoritiesService authoritiesService;

    private Authorities authority1;
    private Authorities authority2;

    @BeforeEach
    void setUp() {
        authority1 = new Authorities();
        authority1.setId(1);
        authority1.setAuthority("CAMIONERO");

        authority2 = new Authorities();
        authority2.setId(2);
        authority2.setAuthority("EMPRESA");
    }

    @Test
    void debeRetornarTodasLasAuthorities() {
        when(authoritiesRepository.findAll()).thenReturn(List.of(authority1, authority2));

        Iterable<Authorities> result = authoritiesService.findAll();
        assertNotNull(result);
        assertTrue(result.iterator().hasNext());

        verify(authoritiesRepository).findAll();
    }

    @Test
    void debeRetornarAuthorityCuandoExiste() {
        when(authoritiesRepository.findByName("EMPRESA")).thenReturn(java.util.Optional.of(authority2));
        Authorities auth = authoritiesService.findByAuthority("EMPRESA");
        assertEquals("EMPRESA", auth.getAuthority());
    }

    @Test
    void noDebeRetornarAuthoritySiNoExiste() {
        when(authoritiesRepository.findByName("ADMIN")).thenReturn(java.util.Optional.empty());
        assertThrows(ResourceNotFoundException.class,
            () -> authoritiesService.findByAuthority("ADMIN"));
    }

    @Test
    void debeGuardarAuthority() throws DataAccessException {
        when(authoritiesRepository.save(any(Authorities.class))).thenReturn(authority1);
        authoritiesService.saveAuthorities(authority1);
        verify(authoritiesRepository).save(authority1);
    }

}
