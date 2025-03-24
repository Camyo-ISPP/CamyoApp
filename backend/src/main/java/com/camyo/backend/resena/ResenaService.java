package com.camyo.backend.resena;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResenaService {

    @Autowired
    private ResenaRepository resenaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;


    @Transactional(readOnly = true)
    public List<Resena> obtenerTodasResenasComentadorPorId(Integer id) {
        return resenaRepository.findAllComentadorByUserId(id);
    }

    @Transactional(readOnly = true)
    public List<Resena> obtenerTodasResenasComentadoPorId(Integer id) {
        return resenaRepository.findAllComentadoByUserId(id);
    }

    @Transactional(readOnly = true)
	public Resena obtenerResena(Integer id) {
		return resenaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", id));
	}

    @Transactional
    public Resena crearResena(Resena resena) throws DataAccessException {
        return resenaRepository.save(resena);
    }

    @Transactional
    public Resena actualizarResena(Integer id, Resena resenaDetalles) throws DataAccessException {
        Resena resena = resenaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resena no encontrada con id " + id));

        Usuario comentador = usuarioRepository.findById(resenaDetalles.getComentador().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario comentador no encontrado con id " + resenaDetalles.getComentador().getId()));
        Usuario comentado = usuarioRepository.findById(resenaDetalles.getComentado().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario comentado no encontrado con id " + resenaDetalles.getComentado().getId()));

        resena.setValoracion(resenaDetalles.getValoracion());
        resena.setComentarios(resenaDetalles.getComentarios());
        resena.setComentador(comentador);
        resena.setComentado(comentado);

        return resenaRepository.save(resena);
    }

    @Transactional
    public void eliminarResena(Integer id) throws DataAccessException {
        Resena resena = resenaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resena no encontrada con id " + id));
        resenaRepository.delete(resena);
    }
}