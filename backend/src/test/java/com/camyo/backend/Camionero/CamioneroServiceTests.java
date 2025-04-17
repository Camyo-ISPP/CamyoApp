package com.camyo.backend.Camionero;

import java.time.LocalDate;
import java.util.HashSet;
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
import com.camyo.backend.resena.Resena;
import com.camyo.backend.resena.ResenaService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesService;

import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.camyo.backend.util.EncryptionService;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = Replace.NONE)
@TestInstance(Lifecycle.PER_CLASS)
class CamioneroServiceTests {

    @Autowired
    protected CamioneroService camioneroService;

    @Autowired
    protected UsuarioService usuarioService;

    @Autowired
    protected ResenaService resenaService;

    @Autowired
    protected AuthoritiesService authoritiesService;

    @Autowired
    protected EncryptionService encryptionService;

     /*
    * Declaramos las variables que vayamos a usar fuera del setup 
  */ 
    static List<Integer> camioneroIds = List.of();
    static List<Integer> usuarioIds = List.of(); 

    @BeforeAll
    @Transactional
    void setup(){
     
         /*
        * Creamos las authorities para camioneros y empresas 
      */ 
        Authorities authCam = new Authorities();
        authCam.setAuthority("Camionero");
        authoritiesService.saveAuthorities(authCam);

        Authorities authEmp = new Authorities();
        authEmp.setAuthority("Empresa");
        authoritiesService.saveAuthorities(authEmp);

         /*
        * Creamos 2 usuarios camioneros y 2 empresas 
      */ 
        Usuario u1 = new Usuario();
        u1.setNombre("Manolo");
        u1.setTelefono("651239235");
        u1.setUsername("Manolongo");
        u1.setPassword("12");
        u1.setEmail("manolongo@gmail.com");
        u1.setAuthority(authCam);
        assertDoesNotThrow(() -> usuarioService.guardarUsuario(u1));

        Usuario u2 = new Usuario();
        u2.setNombre("Paco");
        u2.setTelefono("701443950");
        u2.setUsername("Pacomé");
        u2.setPassword("12");
        u2.setEmail("pacome@gmail.com");
        u2.setAuthority(authCam);
        assertDoesNotThrow(() -> usuarioService.guardarUsuario(u2));

        Usuario u3 = new Usuario();
        u3.setNombre("José");
        u3.setTelefono("954010203");
        u3.setUsername("Joselito");
        u3.setPassword("12");
        u3.setEmail("pa23@gmail.com");
        u3.setAuthority(authEmp);
        assertDoesNotThrow(() -> usuarioService.guardarUsuario(u3));

        Usuario u4 = new Usuario();
        u4.setNombre("Carlos");
        u4.setTelefono("681234572");
        u4.setUsername("Carlongo");
        u4.setPassword("12");
        u4.setEmail("caralingo@gmail.com");
        u4.setAuthority(authEmp);
        assertDoesNotThrow(() -> usuarioService.guardarUsuario(u4));

         /*
        * Creamos las reseñas y se las asignamos al primer usuario camionero 
      */ 

        Resena resena1 = new Resena();
        resena1.setValoracion(5);
        resena1.setComentado(u1);
        resena1.setComentador(u3);
        resenaService.crearResena(resena1);

        Resena resena2 = new Resena();
        resena2.setValoracion(3);
        resena2.setComentado(u1);
        resena2.setComentador(u4);
        resenaService.crearResena(resena2);


         /*
        * Creamos los usuarios camioneros 
      */ 

        Camionero c1 = new Camionero();
        c1.setExperiencia(10);
        c1.setDni("VUmZsSSWmTQDw7V42LJm5w==");
        c1.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c1.setDisponibilidad(Disponibilidad.NACIONAL);
        c1.setTieneCAP(true);
        c1.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c1.setUsuario(u1);
        assertDoesNotThrow(() -> camioneroService.guardarCamionero(c1));

        Camionero c2 = new Camionero();
        c2.setExperiencia(10);
        c2.setDni("q9lJi9ibG2ayvdvh4vjoiQ==");
        c2.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c2.setDisponibilidad(Disponibilidad.NACIONAL);
        c2.setTieneCAP(true);
        c2.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c2.setUsuario(u2);
        assertDoesNotThrow(() -> camioneroService.guardarCamionero(c2));

         /*
        * Guardamos los ids de los camioneros y de sus usuarios 
      */ 

        usuarioIds = List.of(u1.getId(), u2.getId());
        camioneroIds = List.of(c1.getId(), c2.getId());
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
    void debeObtenerCamioneroPorDNI() throws Exception{
        Integer idEsperada = camioneroIds.get(0);
        Camionero c1 = camioneroService.obtenerCamioneroPorId(idEsperada);
        String dniEsperado = c1.getDni();


        Optional<Camionero> optCam = camioneroService.obtenerCamioneroPorDNI(encryptionService.decrypt(dniEsperado));
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
    @Transactional
    void debeEliminarCamionero(){
        Authorities authCam = new Authorities();
        authCam.setAuthority("Camionero");
        authoritiesService.saveAuthorities(authCam);

        Usuario u1 = new Usuario();
        u1.setNombre("José");
        u1.setTelefono("854549822");
        u1.setUsername("Joselingo");
        u1.setPassword("12");
        u1.setEmail("joselingo@gmail.com");
        u1.setAuthority(authCam);
        assertDoesNotThrow(() -> usuarioService.guardarUsuario(u1));
        
        Camionero c1 = new Camionero();
        c1.setExperiencia(10);
        c1.setDni("21084571B");
        c1.setLicencias(Set.of(Licencia.C, Licencia.C_E));
        c1.setDisponibilidad(Disponibilidad.NACIONAL);
        c1.setTieneCAP(true);
        c1.setExpiracionCAP(LocalDate.of(2025, 12, 12));
        c1.setUsuario(u1);
        assertDoesNotThrow(() -> camioneroService.guardarCamionero(c1));

        assertDoesNotThrow(() -> camioneroService.eliminarCamionero(c1.getId()));
    }

    @Test
    @Transactional(readOnly = true)
    void debeObtenerValoracionMedia(){
        assertEquals(4.0, camioneroService.obtenerValoracionMedia(camioneroIds.get(0)));
    }
}
