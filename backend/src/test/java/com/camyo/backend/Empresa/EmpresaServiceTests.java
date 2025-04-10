package com.camyo.backend.Empresa;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesService;

import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestInstance(Lifecycle.PER_CLASS)
class EmpresaServiceTests {

    @Autowired
    protected EmpresaService empresaService;

    @Autowired
    protected UsuarioService usuarioService;

    @Autowired
    protected OfertaService ofertaService;

    @Autowired
    protected AuthoritiesService authoritiesService;

    /*
     * Declaramos las variables que vayamos a usar fuera del setup
     */
    static Empresa e1 = new Empresa();
    static Empresa e2 = new Empresa();

    @BeforeAll
    @Transactional
    void setup() {

        /*
         * Creamos las authorities para empresas y empresas
         */

        Authorities authEmp = new Authorities();
        authEmp.setAuthority("Empresa");
        authoritiesService.saveAuthorities(authEmp);

        /*
         * Creamos 2 usuarios empresas
         */
        Usuario u1 = new Usuario();
        u1.setNombre("Manolo");
        u1.setTelefono("123456879");
        u1.setUsername("Robertongo");
        u1.setPassword("12");
        u1.setEmail("robertongo@gmail.com");
        u1.setAuthority(authEmp);
        usuarioService.guardarUsuario(u1);

        Usuario u2 = new Usuario();
        u2.setNombre("Paco");
        u2.setTelefono("123456872");
        u2.setUsername("Pacolongo");
        u2.setPassword("12");
        u2.setEmail("pacolongo@gmail.com");
        u2.setAuthority(authEmp);
        usuarioService.guardarUsuario(u2);

        /*
         * Creamos las ofertas y se las asignamos a la primera empresa
         */

        // OfertaConTrabajoDTO o1 = new OfertaConTrabajoDTO();
        // o1.setTitulo("Test1");
        // o1.setExperiencia(1);
        // o1.setNotas("Prueba1");
        // ofertaService.crearOfertaConTrabajo(o1);

        // OfertaConTrabajoDTO o2 = new OfertaConTrabajoDTO();
        // o2.setTitulo("Test2");
        // o2.setExperiencia(2);
        // o2.setNotas("Prueba2");
        // ofertaService.crearOfertaConTrabajo(o2);

        /*
         * Creamos los usuarios empresas
         */

        e1 = new Empresa();
        e1.setWeb("https://e1.com");
        e1.setNif("A12345678");
        e1.setUsuario(u1);
        // e1.setOfertas(List.of(o1, o2));
        empresaService.guardarEmpresa(e1);

        e2 = new Empresa();
        e2.setWeb("https://e2.com");
        e2.setNif("B12345678");
        e2.setUsuario(u2);
        // e1.setOfertas(List.of(o1, o2));
        empresaService.guardarEmpresa(e2);

        /*
         * Guardamos los ids de los empresas y de sus usuarios
         */
    }

    Set<Empresa> devuelveEmpresas(){
        return Set.of(e1, e2);
    }


    @Test
    @Transactional(readOnly = true)
    void debeObtenerTodos() {
        List<Empresa> empresas = empresaService.obtenerTodasEmpresas();
        Assert.notEmpty(empresas, "La lista de empresas está vacía");
        assertEquals(2, empresas.size());
    }

    @ParameterizedTest
    @MethodSource("devuelveEmpresas")
    @Transactional
    void debeObtenerEmpresaPorId(Empresa e) {
        assertDoesNotThrow(() -> empresaService.obtenerEmpresaPorId(e.getId()));
        Empresa eObtenida = empresaService.obtenerEmpresaPorId(e.getId());
        assertEquals(e.getId(), eObtenida.getId());

    }

    @ParameterizedTest
    @Transactional(readOnly = true)
    @ValueSource(ints = { 0, -1, Integer.MIN_VALUE, Integer.MAX_VALUE })
    void noDebeObtenerEmpresaPorId(int id) {
        assertThrows(ResourceNotFoundException.class, () -> empresaService.obtenerEmpresaPorId(id));
    }

    @ParameterizedTest
    @MethodSource("devuelveEmpresas")
    void debeObtenerEmpresaPorUsuario(Empresa e) {
        Integer idUsuario = e.getUsuario().getId();

        assertDoesNotThrow(() -> empresaService.obtenerEmpresaPorUsuario(e.getId()));
        Empresa eObtenida = empresaService.obtenerEmpresaPorUsuario(idUsuario).get();
        assertEquals(idUsuario, eObtenida.getUsuario().getId());
    }

    @ParameterizedTest
    @Transactional(readOnly = true)
    @ValueSource(ints = { 0, -1, Integer.MIN_VALUE, Integer.MAX_VALUE })
    void noDebeObtenerEmpresaPorUsuario(int id) {
        assertEquals(true, empresaService.obtenerEmpresaPorUsuario(id).isEmpty());
    }

    @Test
    @Transactional(readOnly = true)
    void debeObtenerEmpresaPorNIF() {
        Integer idEsperada = e1.getId();
        String nifEsperado = e1.getNif();

        Optional<Empresa> optEm = empresaService.obtenerEmpresaPorNif(nifEsperado);
        assertTrue(optEm.isPresent());

        Empresa camioneroRecogido = optEm.get();
        String nifRecogido = optEm.get().getNif();

        assertEquals(camioneroRecogido.getId(), idEsperada);
        assertEquals(nifEsperado, nifRecogido);
    }

    @ParameterizedTest
    @ValueSource(strings = { "", " ", "21436587F" })
    @Transactional(readOnly = true)
    void noDebeObtenerEmpresaPorDNI(String nif) {
        assertTrue(empresaService.obtenerEmpresaPorNif(nif).isEmpty());
    }


    @Test
    @Transactional
    void debeEliminarEmpresa() {
        Authorities authEmp = new Authorities();
        authEmp.setAuthority("Empresa");
        authoritiesService.saveAuthorities(authEmp);

        Usuario u3 = new Usuario();
        u3.setNombre("José");
        u3.setTelefono("123455879");
        u3.setUsername("Joselingo");
        u3.setPassword("12");
        u3.setEmail("joselingo@gmail.com");
        u3.setAuthority(authEmp);
        usuarioService.guardarUsuario(u3);

        Empresa e3 = new Empresa();
        e3.setNif("V12345688");
        e3.setWeb("https://prueba.com");
        e3.setUsuario(u3);
        empresaService.guardarEmpresa(e3);

        assertDoesNotThrow(() -> empresaService.eliminarEmpresa(e3.getId()));
    }

}
