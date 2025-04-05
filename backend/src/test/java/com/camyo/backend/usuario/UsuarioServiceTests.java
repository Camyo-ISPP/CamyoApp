package com.camyo.backend.usuario;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.resena.Resena;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
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
@TestInstance(Lifecycle.PER_CLASS)
class UsuarioServiceTests {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AuthoritiesService authoritiesService;

    private Usuario user1;
    private Usuario user2;

    @BeforeAll
    @Transactional
    void setup() {
        // Crea un authority:
        Authorities auth = new Authorities();
        auth.setAuthority("ROLE_USER");
        authoritiesService.saveAuthorities(auth);

        // Crea user1
        user1 = new Usuario();
        user1.setNombre("Alice");
        user1.setEmail("alice@test.com");
        user1.setUsername("aliceUser");
        user1.setPassword("pass");
        user1.setAuthority(auth);
        usuarioService.guardarUsuario(user1); // ID auto?

        // Crea user2
        user2 = new Usuario();
        user2.setNombre("Bob");
        user2.setEmail("bob@test.com");
        user2.setUsername("bobUser");
        user2.setPassword("pass2");
        user2.setAuthority(auth);
        usuarioService.guardarUsuario(user2);
    }

    @Test
    @Transactional
    void testGuardarUsuario_Exito() {
        Authorities auth = authoritiesService.findByAuthority("ROLE_USER");
        Usuario nuevo = new Usuario();
        nuevo.setNombre("Charlie");
        nuevo.setEmail("charlie@test.com");
        nuevo.setUsername("charlieUser");
        nuevo.setPassword("123456");
        nuevo.setAuthority(auth);

        Usuario guardado = usuarioService.guardarUsuario(nuevo);
        assertNotNull(guardado.getId());
        assertEquals("charlie@test.com", guardado.getEmail());
        assertNotEquals("123456", guardado.getPassword(), "La password debería estar encriptada");
    }

    @Test
    void testGuardarUsuario_EmailYaExiste() {
        // Intentar guardar un usuario con el mismo email de user1 => lanza exception
        Usuario repetido = new Usuario();
        repetido.setNombre("Otra");
        repetido.setEmail("alice@test.com"); // repetido
        repetido.setUsername("otraUser");
        repetido.setPassword("p4ss");
        repetido.setAuthority(user1.getAuthority());

  
        whenEmailExisteDisparaExcepcion(repetido);
    }

    private void whenEmailExisteDisparaExcepcion(Usuario repetido) {

        assertThrows(IllegalArgumentException.class, () -> usuarioService.guardarUsuario(repetido));
    }

    @Test
    void testGuardarUsuario_UsernameYaExiste() {
        // Mismo approach, con username duplicado
        Usuario repetido = new Usuario();
        repetido.setNombre("Otra2");
        repetido.setEmail("otra2@test.com");
        repetido.setUsername("aliceUser"); // repetido
        repetido.setPassword("p4ss");
        repetido.setAuthority(user1.getAuthority());

        assertThrows(IllegalArgumentException.class, () -> usuarioService.guardarUsuario(repetido));
    }

    @Test
    void testObtenerUsuarioPorId_NoEncontrado() {
        assertThrows(ResourceNotFoundException.class,
            () -> usuarioService.obtenerUsuarioPorId(9999));
    }

    @Test
    @Transactional
    void testObtenerUsuarios() {
        // ya tenemos user1, user2 en la base
        List<Usuario> todos = usuarioService.obtenerUsuarios();
        // aserciones
        assertTrue(todos.size() >= 2);
    }

    @Test
    @Transactional
    void testObtenerValoracionMedia_SinResenas() {
        // user1 no tiene reseñas? si no tiene => 0.0f
        Float valor = usuarioService.obtenerValoracionMedia(user1.getId());
        assertEquals(0.0f, valor);
    }

    @Test
    void testUpdateUser_EmailDuplicado() {
        Usuario datos = new Usuario();
        datos.setEmail("bob@test.com"); // email user2
        datos.setPassword("newPass");

        // user1 intenta cambiar su email al de user2 => exception
        assertThrows(IllegalArgumentException.class,
            () -> usuarioService.updateUser(datos, user1.getId()));
    }

    @Test
    void testUpdateUser_NoExiste() {
        Usuario datos = new Usuario();
        datos.setEmail("otro@test.com");
        datos.setPassword("pass");

        assertThrows(ResourceNotFoundException.class,
            () -> usuarioService.updateUser(datos, 9999));
    }

    @Test
    @Transactional
    void testEliminarUsuario_Exito() {
        // Creamos uno nuevo
        Usuario extra = new Usuario();
        extra.setNombre("EliminarMe");
        extra.setEmail("elim@test.com");
        extra.setUsername("elimUser");
        extra.setPassword("xxx");
        extra.setAuthority(user1.getAuthority());
        Usuario guardado = usuarioService.guardarUsuario(extra);

        // lo eliminamos
        assertDoesNotThrow(() -> usuarioService.eliminarUsuario(guardado.getId()));
        assertThrows(ResourceNotFoundException.class,
            () -> usuarioService.obtenerUsuarioPorId(guardado.getId()));
    }

    @Test
    void testEliminarUsuario_NoExiste() {
        assertThrows(ResourceNotFoundException.class,
            () -> usuarioService.eliminarUsuario(9999));
    }


}
