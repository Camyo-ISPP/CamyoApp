package com.camyo.backend.resena;

import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesRepository;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;
import com.camyo.backend.exceptions.ResourceNotFoundException;

import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

import java.util.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ResenaServiceTests {

    @Autowired
    private ResenaService resenaService;

    @Autowired
    private ResenaRepository resenaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AuthoritiesRepository authoritiesRepository;

    private Usuario comentado;
    private Usuario comentador;
    private Resena r1;
    private Resena r2;

    @BeforeAll
    @Transactional
void setup() {
       
        Authorities authUser = new Authorities();
        authUser.setAuthority("ROLE_USER");
        authoritiesRepository.save(authUser);

        comentado = new Usuario();
        comentado.setUsername("ComentadoTest");
        comentado.setEmail("comentado.unique@ej.com");
        comentado.setPassword("123");     
        comentado.setAuthority(authUser);  
        usuarioRepository.save(comentado);

      
        comentador = new Usuario();
        comentador.setUsername("ComentadorTest");
        comentador.setEmail("comentador.unique@ej.com");
        comentador.setPassword("123");
        comentador.setAuthority(authUser);
        usuarioRepository.save(comentador);

       
        r1 = new Resena();
        r1.setValoracion(4);
        r1.setComentado(comentado);
        r1.setComentador(comentador);
        r1 = resenaService.crearResena(r1);

        r2 = new Resena();
        r2.setValoracion(5);
        r2.setComentado(comentado);
        r2.setComentador(comentador);
        r2 = resenaService.crearResena(r2);
    }

    @Test
    @Transactional
    void testCrearResena_Exito() {
        Resena nueva = new Resena();
        nueva.setValoracion(3);
        nueva.setComentado(comentado);
        nueva.setComentador(comentador);

        Resena guardada = resenaService.crearResena(nueva);
        assertNotNull(guardada.getId());
    }

    @Test
    @Transactional
    void testObtenerResena() {
        Resena res = resenaService.obtenerResena(r1.getId());
        assertEquals(4, res.getValoracion());
    }

    @Test
    @Transactional
    void testActualizarResena_NoComentadorExiste() {
        Resena editar = new Resena();
        editar.setValoracion(1);

      
        Usuario noExiste = new Usuario();
        noExiste.setId(999);
        editar.setComentador(noExiste);
        editar.setComentado(comentado);

        assertThrows(ResourceNotFoundException.class,
            () -> resenaService.actualizarResena(r1.getId(), editar));
    }

    @Test
    @Transactional
    void testEliminarResena() {
        assertDoesNotThrow(() -> resenaService.eliminarResena(r1.getId()));
        assertThrows(ResourceNotFoundException.class,
            () -> resenaService.obtenerResena(r1.getId()));
    }


}
