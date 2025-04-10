package com.camyo.backend.camionero;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaRepository;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.camyo.backend.util.EncryptionService;

@Service
public class CamioneroService {

    private final CamioneroRepository camioneroRepository;
    private final UsuarioService usuarioService;
    private final OfertaRepository ofertaRepository;
    private final EncryptionService encryptionService;

    @Autowired
    public CamioneroService(CamioneroRepository camioneroRepository, 
                            UsuarioService usuarioService, 
                            OfertaRepository ofertaRepository,
                            EncryptionService encryptionService) {
        this.camioneroRepository = camioneroRepository;
        this.usuarioService = usuarioService;
        this.ofertaRepository = ofertaRepository;
        this.encryptionService = encryptionService;
    }

    @Transactional(readOnly = true)
    public Camionero obtenerCamioneroPorId(Integer id) {
        return camioneroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camionero", "ID", id));
    }

    @Transactional(readOnly = true)
    public Camionero obtenerCamioneroPorUsuario(Integer id) {
        return camioneroRepository.obtenerCamioneroPorUsuario(id)
                .orElseThrow(() -> new ResourceNotFoundException("Camionero", "ID", id));
    }

    @Transactional(readOnly = true)
    public Optional<Camionero> obtenerCamioneroPorDNI(String dni) {
        try {
            String encryptedDni = encryptionService.encrypt(dni);
            return camioneroRepository.obtenerPorDNI(encryptedDni);
        } catch (Exception e) {
            throw new RuntimeException("Error al cifrar el DNI durante la búsqueda: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Camionero guardarCamionero(Camionero camionero) {
        try {
            String encryptedDni = encryptionService.encrypt(camionero.getDni());
            camionero.setDni(encryptedDni);
        } catch (Exception e) {
            throw new RuntimeException("Error al cifrar el DNI: " + e.getMessage(), e);
        }
        return camioneroRepository.save(camionero);
    }

    @Transactional
    public void eliminarCamionero(Integer id) {
        Camionero camionero = obtenerCamioneroPorId(id);
        camioneroRepository.delete(camionero);
    }

    @Transactional(readOnly = true)
    public double obtenerValoracionMedia(Integer id) {
        Usuario user = obtenerCamioneroPorId(id).getUsuario();
        return usuarioService.obtenerValoracionMedia(user.getId()).doubleValue();
    }

    @Transactional
    public void eliminarCamioneroDeOfertas(Camionero camionero, List<Oferta> aplicadas, List<Oferta> rechazadas) {
        for (Oferta oferta : aplicadas) {
            oferta.getAplicados().remove(camionero);
            ofertaRepository.save(oferta);
        }
        for (Oferta oferta : rechazadas) {
            oferta.getRechazados().remove(camionero);
            ofertaRepository.save(oferta);
        }
    }

}