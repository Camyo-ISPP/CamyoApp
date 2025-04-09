package com.camyo.backend.suscripcion;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestInstance(Lifecycle.PER_CLASS)
class SuscripcionServiceTests {

    @Autowired
    protected SuscripcionService suscripcionService;

    @Autowired
    protected SuscripcionRepository suscripcionRepository;

    @Autowired
    protected EmpresaService empresaService;

    @Autowired
    protected UsuarioService usuarioService;

    @Autowired
    protected AuthoritiesService authoritiesService;

    private Empresa e1;
    private Suscripcion s1;

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
         * Creamos un usuario
         */
        Usuario u1 = new Usuario();
        u1.setNombre("Manolo");
        u1.setTelefono("620300400");
        u1.setUsername("Robertongo");
        u1.setPassword("12");
        u1.setEmail("robertongo@gmail.com");
        u1.setAuthority(authEmp);
        assertDoesNotThrow(() -> usuarioService.guardarUsuario(u1));

        /*
         * Creamos la empresa
         */
        e1 = new Empresa();
        e1.setId(null);
        e1.setWeb("http://empresa.test");
        e1.setUsuario(u1);
        e1.setNif("A12345674"); 
        // ... haz un usuario, etc.

        empresaService.guardarEmpresa(e1);

        /*
         * Creamos la suscripción
         */ 
        s1 = new Suscripcion();
        s1.setNivel(PlanNivel.BASICO);
        s1.setEmpresa(e1);
        s1.setActiva(true);
        s1.setFechaInicio(LocalDate.now());

        suscripcionRepository.save(s1);
    }

    @Test
    @Transactional
    void testAsignarSuscripcion_Gratis() {
        Suscripcion nueva = suscripcionService.asignarSuscripcion(e1.getId(), PlanNivel.GRATIS, null);
        assertEquals(PlanNivel.GRATIS, nueva.getNivel());
        assertNull(nueva.getFechaFin());
    }

    @Test
    @Transactional
    void testObtenerSuscripcionActiva_Caducada() {
        // Forzamos que la ya creada suscripción caduque
        s1.setFechaFin(LocalDate.now().minusDays(1));
        suscripcionRepository.save(s1);

        assertThrows(ResourceNotFoundException.class,
            () -> suscripcionService.obtenerSuscripcionActiva(e1.getId()));
    }

    @Test
    @Transactional
    void testDesactivarManual() {
        s1.setActiva(true);
        suscripcionRepository.save(s1);

        s1.setActiva(false);
        Suscripcion saved = suscripcionService.guardar(s1);
        assertFalse(saved.getActiva());
    }
}
