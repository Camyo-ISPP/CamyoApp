package com.camyo.backend.camionero;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.exceptions.InvalidNifException;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.camyo.backend.util.Validators;

@Service
public class CamioneroService {

    private final CamioneroRepository camioneroRepository;
    private final UsuarioService usuarioService;

    @Autowired
    public CamioneroService(CamioneroRepository camioneroRepository, UsuarioService usuarioService) {
        this.camioneroRepository = camioneroRepository;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<Camionero> obtenerTodosCamioneros() {
        return camioneroRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Camionero obtenerCamioneroPorId(Integer id) {
        Optional<Camionero> optionalCamionero = camioneroRepository.findById(id);
        return optionalCamionero.orElseThrow(
                () -> new ResourceNotFoundException("Camionero", "ID", id));
    }

    @Transactional(readOnly = true)
    public Camionero obtenerCamioneroPorUsuario(Integer id) {
        Optional<Camionero> optionalCamionero = camioneroRepository.obtenerCamioneroPorUsuario(id);
        return optionalCamionero.orElseThrow(
                () -> new ResourceNotFoundException("Camionero", "ID", id));
    }

    @Transactional(readOnly = true)
    public Optional<Camionero> obtenerCamioneroPorDNI(String dni) {
        return camioneroRepository.obtenerPorDNI(dni);
    }

    @Transactional()
    public Camionero guardarCamionero(Camionero camionero) throws InvalidNifException {
        Validators.comprobarNif(camionero.getDni());
        return camioneroRepository.save(camionero);
    }


    @Transactional()
    public Camionero actualizarCamionero(Integer id, Camionero camioneroUpdated) throws InvalidNifException {
        Camionero existingCamionero = obtenerCamioneroPorId(id);
        // Ignoramos "id", "usuario", y además "camiones" y "ofertas" si no queremos sobreescribirlas
        BeanUtils.copyProperties(camioneroUpdated, existingCamionero, "id", "usuario", "camiones", "ofertas");
        return guardarCamionero(existingCamionero);
    }
    
    @Transactional()
    public void eliminarCamionero(Integer id) {
        Camionero camionero = obtenerCamioneroPorId(id);
        camioneroRepository.delete(camionero);
    }

    @Transactional(readOnly = true)
    public double obtenerValoracionMedia(Integer id) {
        Usuario user = obtenerCamioneroPorId(id).getUsuario();        
        return usuarioService.obtenerValoracionMedia(user.getId()).doubleValue();
    }
    
}