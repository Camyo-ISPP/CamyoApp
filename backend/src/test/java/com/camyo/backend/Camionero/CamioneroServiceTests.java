package com.camyo.backend.Camionero;

import java.time.LocalDate;
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
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.camionero.Disponibilidad;
import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesService;
import com.camyo.backend.usuario.Resena;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestInstance(Lifecycle.PER_CLASS)
class CamioneroServiceTests {

    @Autowired
    protected CamioneroService camioneroService;

    @Autowired
    protected UsuarioService usuarioService;

    // @Autowired
    // protected ResenaService resenaService;

    @Autowired
    protected AuthoritiesService authoritiesService;

    static List<Integer> camioneroIds = List.of();
    static List<Integer> usuarioIds = List.of(); 

    @BeforeAll
    @Transactional
    void setup(){
     
        Authorities authCam = new Authorities();
        authCam.setAuthority("Camionero");
        authoritiesService.saveAuthorities(authCam);

        Usuario u1 = new Usuario();
        u1.setNombre("Manolo");
        u1.setTelefono("123456879");
        u1.setUsername("Manolongo");
        u1.setPassword("12");
        u1.setEmail("manolongo@gmail.com");
        u1.setAuthority(authCam);
        usuarioService.guardarUsuario(u1);

        Resena resena1 = new Resena();
        resena1.setValoracion(5);
        resena1.setUsuario(u1);
        //resenaService.guardarResena(resena1);

        Resena resena2 = new Resena();
        resena2.setValoracion(3);
        resena2.setUsuario(u1);
        //resenaService.guardarResena(resena2);

        

        Camionero c1 = new Camionero();
        c1.setExperiencia(10);
        c1.setDni("12345678Q");
        c1.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c1.setDisponibilidad(Disponibilidad.NACIONAL);
        c1.setTieneCAP(true);
        c1.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c1.setUsuario(u1);
        camioneroService.guardarCamionero(c1);

        Usuario u2 = new Usuario();
        u2.setNombre("Paco");
        u2.setTelefono("123456872");
        u2.setUsername("Pacomé");
        u2.setPassword("12");
        u2.setEmail("pacome@gmail.com");
        u2.setAuthority(authCam);
        usuarioService.guardarUsuario(u2);

        Camionero c2 = new Camionero();
        c2.setExperiencia(10);
        c2.setDni("12445678Q");
        c2.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c2.setDisponibilidad(Disponibilidad.NACIONAL);
        c2.setTieneCAP(true);
        c2.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c2.setUsuario(u2);
        camioneroService.guardarCamionero(c2);

        usuarioIds = List.of(u1.getId(), u2.getId());
        camioneroIds = List.of(c1.getId(), c2.getId());
    }

    @Test
    @Transactional(readOnly = true)
    void debeObtenerTodos(){
        List<Camionero> camioneros= camioneroService.obtenerTodosCamioneros();
        Assert.notEmpty(camioneros, "La lista de camioneros está vacía");
        assertEquals(2, camioneros.size());
    }

    @Test
    @Transactional
    void debeObtenerCamioneroPorId(){
        for (Integer id : camioneroIds) {
            assertDoesNotThrow(() -> camioneroService.obtenerCamioneroPorId(id));
            Camionero c = camioneroService.obtenerCamioneroPorId(id);
            assertEquals(id, c.getId());
        }
    }

    @ParameterizedTest
    @Transactional(readOnly = true)
    @ValueSource(ints = {0, -1, Integer.MIN_VALUE, Integer.MAX_VALUE})
    void noDebeObtenerCamioneroPorId(int id){
        assertThrows(ResourceNotFoundException.class, () -> camioneroService.obtenerCamioneroPorId(id));
    }

    @Test
    void debeObtenerCamioneroPorUsuario(){
        for (Integer id : usuarioIds) {
            assertDoesNotThrow(() -> camioneroService.obtenerCamioneroPorUsuario(id));
            Camionero c = camioneroService.obtenerCamioneroPorUsuario(id);
            assertEquals(id, c.getUsuario().getId());
        }
    }
    
    @ParameterizedTest
    @Transactional(readOnly = true)
    @ValueSource(ints = {0, -1, Integer.MIN_VALUE, Integer.MAX_VALUE})
    void noDebeObtenerCamioneroPorUsuario(int id){
        assertThrows(ResourceNotFoundException.class, () -> camioneroService.obtenerCamioneroPorUsuario(id));
    }

    @Test
    @Transactional(readOnly = true)
    void debeObtenerCamioneroPorDNI(){
        Integer idEsperada = camioneroIds.get(0);
        Camionero c1 = camioneroService.obtenerCamioneroPorId(idEsperada);
        String dniEsperado = c1.getDni();


        Optional<Camionero> optCam = camioneroService.obtenerCamioneroPorDNI(dniEsperado);
        assertTrue(optCam.isPresent());

        Camionero camioneroRecogido = optCam.get();
        String dniRecogido = optCam.get().getDni();

        assertEquals(camioneroRecogido.getId(), idEsperada);
        assertEquals(dniEsperado, dniRecogido);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "21436587F"})
    @Transactional(readOnly = true)
    void noDebeObtenerCamioneroPorDNI(String dni){
        assertTrue(camioneroService.obtenerCamioneroPorDNI(dni).isEmpty());;
    }

    @Test
    @Transactional(readOnly = true)
    void debeActualizarCamionero(){
        Integer id = camioneroIds.get(0);
        Camionero camNuevo = camioneroService.obtenerCamioneroPorId(id);

        Disponibilidad newDisponibilidad = Disponibilidad.INTERNACIONAL;
        camNuevo.setDisponibilidad(newDisponibilidad);

        int newExperiencia = 20;
        camNuevo.setExperiencia(newExperiencia);

        LocalDate newDate = LocalDate.of(2026, 12, 01);
        camNuevo.setExpiracionCAP(newDate);

        Set<Licencia> newLicencias = Set.of(Licencia.C, Licencia.C_E);
        camNuevo.setLicencias(newLicencias);

        Camionero camioneroActualizado = camioneroService.actualizarCamionero(id, camNuevo);

        assertEquals(newLicencias, camioneroActualizado.getLicencias());
        assertEquals(newExperiencia, camioneroActualizado.getExperiencia());
        assertEquals(newDate, camioneroActualizado.getExpiracionCAP());
        assertEquals(id, camioneroActualizado.getId());

    }

    @Test
    @Transactional
    void debeEliminarCamionero(){
        Authorities authCam = new Authorities();
        authCam.setAuthority("Camionero");
        authoritiesService.saveAuthorities(authCam);

        Usuario u1 = new Usuario();
        u1.setNombre("José");
        u1.setTelefono("123455879");
        u1.setUsername("Joselito");
        u1.setPassword("12");
        u1.setEmail("joselito@gmail.com");
        u1.setAuthority(authCam);
        usuarioService.guardarUsuario(u1);
        
        Camionero c1 = new Camionero();
        c1.setExperiencia(10);
        c1.setDni("12345688V");
        c1.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c1.setDisponibilidad(Disponibilidad.NACIONAL);
        c1.setTieneCAP(true);
        c1.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c1.setUsuario(u1);
        camioneroService.guardarCamionero(c1);

        assertDoesNotThrow(() -> camioneroService.eliminarCamionero(c1.getId()));
    }

    @Test
    @Transactional(readOnly = true)
    void debeObtenerValoracionMedia(){
        assertEquals(4.0, camioneroService.obtenerValoracionMedia(camioneroIds.get(0)));
    }
}
