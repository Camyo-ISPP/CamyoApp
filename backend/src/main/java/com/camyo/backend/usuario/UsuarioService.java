package com.camyo.backend.usuario;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.resena.Resena;

@Service
public class UsuarioService {


    @Autowired
	private final PasswordEncoder encoder;
	private UsuarioRepository usuarioRepository;

    @Autowired
	public UsuarioService(PasswordEncoder encoder, UsuarioRepository usuarioRepository) {
		this.encoder = encoder;
		this.usuarioRepository = usuarioRepository;
	}

    @Transactional(readOnly = true)
    public List<Usuario> obtenerUsuarios() {
        Iterable<Usuario> usuariosIterable = usuarioRepository.findAll();
        return StreamSupport.stream(usuariosIterable.spliterator(), false)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
	public Usuario obtenerUsuarioPorId(Integer id) {
		return usuarioRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
	}

    public Boolean existeUsuarioPorUsername(String username) {
		return usuarioRepository.existsByUsername(username);
	}

	public Boolean existeUsuarioPorEmail(String email) {
		return usuarioRepository.existsByEmail(email);
	}

	@Transactional(readOnly = true)
	public Usuario obtenerUsuarioActual() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null)
			throw new ResourceNotFoundException("Nobody authenticated!");
		else
			return usuarioRepository.findByUsername(auth.getName())
					.orElseThrow(() -> new ResourceNotFoundException("User", "Username", auth.getName()));
	}

    @Transactional
    public Usuario guardarUsuario(Usuario usuario) throws DataAccessException {
        usuario.setPassword(encoder.encode(usuario.getPassword()));
		usuarioRepository.save(usuario);
		return usuario;
    }

    @Transactional
    public Usuario guardarUsuarioSinEncode(Usuario usuario) throws DataAccessException {
		return usuarioRepository.save(usuario);
    }

    @Transactional
    public void eliminarUsuario(Integer id) {
        Usuario usuarioABorrar = obtenerUsuarioPorId(id);
        this.usuarioRepository.delete(usuarioABorrar);
    }

    @Transactional
    public Float obtenerValoracionMedia(Integer id){
        List<Resena> list = usuarioRepository.obtenerReseñas(id);
        if (list.isEmpty()) {
            return 0.0f;
        }
        Integer media = 0;
        for (Resena reseña : list) {
            media += reseña.getValoracion();
        }
        return (float) media / list.size();     
    }
    
    public Integer obtenerCamioneroIdPorUsuarioId(Integer camioneroId) {
        return usuarioRepository.findCamioneroIdByUsuarioId(camioneroId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado para el camioneroId: " + camioneroId));
    }

    public Integer obtenerEmpresaIdPorUsuarioId(Integer empresaId) {
        return usuarioRepository.findEmpresaIdByUsuarioId(empresaId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado para el empresaId: " + empresaId));
    }  
}