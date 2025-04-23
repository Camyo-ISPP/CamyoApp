package com.camyo.backend.Usuario;

import org.junit.jupiter.api.Test;

import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;

import static org.junit.jupiter.api.Assertions.*;

class UsuarioEntityTests {

    @Test
    void hasAnyAuthorityRetornaTrueSiCoincide() {
        Authorities rol = new Authorities();
        rol.setAuthority("CAMIONERO");
        Usuario usuario = new Usuario();
        usuario.setAuthority(rol);

        boolean result = usuario.hasAnyAuthority("EMPRESA", "CAMIONERO");
        assertTrue(result);
    }

    @Test
    void hasAnyAuthorityRetornaFalseSiNoCoincide() {
        Authorities rol = new Authorities();
        rol.setAuthority("CAMIONERO");
        Usuario usuario = new Usuario();
        usuario.setAuthority(rol);

        boolean result = usuario.hasAnyAuthority("EMPRESA", "ADMIN");
        assertFalse(result);
    }

    @Test
    void hasAnyAuthorityRetornaFalseSiArrayVacio() {
        Authorities rol = new Authorities();
        rol.setAuthority("CAMIONERO");
        Usuario usuario = new Usuario();
        usuario.setAuthority(rol);

        boolean result = usuario.hasAnyAuthority();
        assertFalse(result);
    }
}
