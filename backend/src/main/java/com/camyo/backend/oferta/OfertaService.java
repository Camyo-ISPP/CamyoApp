package com.camyo.backend.oferta;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroRepository;
import com.camyo.backend.configuration.services.UserDetailsImpl;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaRepository;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;

import jakarta.validation.Valid;

@Service
public class OfertaService {

    @Autowired
    private OfertaRepository ofertaRepository;
    @Autowired
    private CargaRepository cargaRepository;
    @Autowired
    private TrabajoRepository trabajoRepository;
    @Autowired
    private CamioneroRepository camioneroRepository;
    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private SuscripcionService suscripcionService;

    @Autowired
    private UsuarioRepository usuarioRepository;


    @Transactional(readOnly = true)
    public List<Oferta> obtenerOfertas() {
        return ofertaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Oferta> obtenerOfertasPorTipo() {
        return ofertaRepository.encontrarGenerales();
    }

    @Transactional(readOnly = true)
    public List<Oferta> obtenerOfertasCarga() {
        return ofertaRepository.encontrarCargas();
    }

    @Transactional(readOnly = true)
    public Carga obtenerCarga(Integer oferta_id) {
        return ofertaRepository.encontrarCargaPorOferta(oferta_id);
    }

    @Transactional(readOnly = true)
    public Trabajo obtenerTrabajo(Integer oferta_id) {
        return ofertaRepository.encontrarTrabajoPorOferta(oferta_id);
    }

    @Transactional(readOnly = true)
    public Oferta obtenerOfertaPorId(Integer id) {
        return ofertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Oferta", "id", id));
    }

    @Transactional(readOnly = true)
    public List<List<Oferta>> obtenerOfertasPorCamionero(Integer camioneroId) {
        camioneroRepository.findById(camioneroId)
            .orElseThrow(() -> new ResourceNotFoundException("Camionero", "id", camioneroId));
        List<Oferta> aplicadas = ofertaRepository.encontrarAplicadas(camioneroId);
        List<Oferta> rechazadas = ofertaRepository.encontrarRechazadas(camioneroId);
        List<Oferta> asignadas = ofertaRepository.encontrarAsignadas(camioneroId);
        return List.of(aplicadas, rechazadas, asignadas);
    }

    @Transactional(readOnly = true)
    public List<Oferta> obtenerOfertasPorEmpresa(Integer empresaId) {
        empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", empresaId));
        
        return ofertaRepository.encontrarOfertasPorEmpresa(empresaId);
    }

    @Transactional
    public Oferta guardarOferta(Oferta oferta) {
        return ofertaRepository.save(oferta);
    }

    @Transactional
    public void eliminarOferta(Integer id) {
        ofertaRepository.deleteById(id);
    }

    @Transactional
    public Oferta modificarOferta(@Valid Oferta oferta, Integer idToUpdate) {
        Oferta toUpdate = obtenerOfertaPorId(idToUpdate);
        if (oferta.getEmpresa() != null && oferta.getEmpresa().getId() != null) {
            Empresa empresa = empresaRepository.findById(oferta.getEmpresa().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa", "id", oferta.getEmpresa().getId()));
            toUpdate.setEmpresa(empresa);
        }
    
        BeanUtils.copyProperties(oferta, toUpdate, "id", "empresa", "licencia");
    
        ofertaRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public Oferta aplicarOferta(Integer ofertaId, Integer camioneroId) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Oferta", "id", ofertaId));

        Camionero cam = camioneroRepository.findById(camioneroId)
                .orElseThrow(() -> new ResourceNotFoundException("Camionero", "id", camioneroId));

        oferta.getAplicados().add(cam);
        return ofertaRepository.save(oferta);
    }

    @Transactional
    public Oferta desaplicarOferta(Integer ofertaId, Integer camioneroId) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Oferta", "id", ofertaId));

        Camionero cam = camioneroRepository.findById(camioneroId)
                .orElseThrow(() -> new ResourceNotFoundException("Camionero", "id", camioneroId));

        oferta.getAplicados().remove(cam);
        return ofertaRepository.save(oferta);
    }

    @Transactional
    public Oferta asignarOferta(Integer ofertaId, Integer camioneroId) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Oferta", "id", ofertaId));

        Camionero cam = camioneroRepository.findById(camioneroId)
                .orElseThrow(() -> new ResourceNotFoundException("Camionero", "id", camioneroId));

        oferta.setCamionero(cam);
        oferta.setEstado(OfertaEstado.CERRADA);
        oferta.getAplicados().remove(cam);
        oferta.getRechazados().addAll(oferta.getAplicados());
        oferta.getAplicados().removeAll(oferta.getAplicados());
        return ofertaRepository.save(oferta);
    }

    @Transactional
    public Oferta rechazarOferta(Integer ofertaId, Integer camioneroId) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Oferta", "id", ofertaId));

        Camionero cam = camioneroRepository.findById(camioneroId)
                .orElseThrow(() -> new ResourceNotFoundException("Camionero", "id", camioneroId));

        oferta.getAplicados().remove(cam);
        oferta.getRechazados().add(cam);
        return ofertaRepository.save(oferta);
    }

    @Transactional
    public OfertaCompletaDTO mapearOfertaACompletaDTO(Oferta oferta) {
        OfertaCompletaDTO dto = new OfertaCompletaDTO();
        dto.setId(oferta.getId());
        dto.setTitulo(oferta.getTitulo());
        dto.setExperiencia(oferta.getExperiencia());
        dto.setLicencia(oferta.getLicencia());
        dto.setNotas(oferta.getNotas());
        dto.setEstado(oferta.getEstado());
        dto.setFechaPublicacion(oferta.getFechaPublicacion());
        dto.setSueldo(oferta.getSueldo());
        dto.setLocalizacion(oferta.getLocalizacion());
        dto.setCamionero(oferta.getCamionero());
        dto.setAplicados(oferta.getAplicados());
        dto.setRechazados(oferta.getRechazados());
        dto.setPromoted(oferta.getPromoted() != null ? oferta.getPromoted() : false);
            if (oferta.getEmpresa() != null && oferta.getEmpresa().getUsuario() != null) {
                dto.setNombreEmpresa(oferta.getEmpresa().getUsuario().getNombre());
            }
        if (oferta.getEmpresa() != null && oferta.getEmpresa().getUsuario() != null) {
            dto.setNombreEmpresa(oferta.getEmpresa().getUsuario().getNombre());
        }
        try {
            Carga c = this.obtenerCarga(oferta.getId());
            if (c != null) {
                dto.setTipoOferta("CARGA");
            } else {
                Trabajo t = this.obtenerTrabajo(oferta.getId());
                if (t != null) {
                    dto.setTipoOferta("TRABAJO");
                } else {
                    dto.setTipoOferta("DESCONOCIDO");
                }
            }
        } catch (ResourceNotFoundException ex) {
            dto.setTipoOferta("DESCONOCIDO");
        }
    
        return dto;
    }

    public List<Oferta> obtenerUltimas10Ofertas() {
        return ofertaRepository.findTopByOrderByFechaPublicacionDesc();
    }

    @Transactional
    public Oferta patrocinarOferta(Integer ofertaId) {
        Integer empresaIdAuth = getEmpresaIdFromToken();
        Oferta oferta = obtenerOfertaPorId(ofertaId);
    
        if (!oferta.getEmpresa().getId().equals(empresaIdAuth)) {
            throw new RuntimeException("No tienes permiso para patrocinar esta oferta.");
        }
    
        if (Boolean.TRUE.equals(oferta.getPromoted())) {
            throw new RuntimeException("Esta oferta ya está patrocinada actualmente.");
        }
        PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(empresaIdAuth);
        Integer patrociniosActivos = ofertaRepository.countByEmpresaIdPromotedTrue(empresaIdAuth);
    
        switch (nivel) {
            case GRATIS:
                if (patrociniosActivos >= 1) {
                    throw new RuntimeException("El plan Gratis solo permite patrocinar 1 oferta.");
                }
                break;
            case BASICO:
                if (patrociniosActivos >= 2) {
                    throw new RuntimeException("El plan Básico solo permite patrocinar 2 ofertas.");
                }
                break;
            case PREMIUM:
                break;
        }
    
        oferta.setPromoted(true);
        return guardarOferta(oferta);
    }
    
    @Transactional
    public void desactivarPatrocinio(Integer ofertaId) {
        Integer empresaIdAuth = getEmpresaIdFromToken();
        Oferta oferta = obtenerOfertaPorId(ofertaId);
    
        if (oferta.getEmpresa() == null || !oferta.getEmpresa().getId().equals(empresaIdAuth)) {
            throw new RuntimeException("No tienes permiso para desactivar esta oferta.");
        }
    
        if (!Boolean.TRUE.equals(oferta.getPromoted())) {
            throw new RuntimeException("Esta oferta no está patrocinada.");
        }
    
        oferta.setPromoted(false);
        guardarOferta(oferta);
    }
    
    

    private Integer getEmpresaIdFromToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No hay usuario autenticado");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Usuario usuario = usuarioRepository.findById(userDetails.getId())
            .orElseThrow(() -> new RuntimeException(
                "No existe el usuario con id = " + userDetails.getId()));
        if (!usuario.hasAuthority("EMPRESA")) {
            throw new RuntimeException("El usuario autenticado no es una empresa");
        }
        Empresa empresa = empresaRepository.obtenerPorUsuario(usuario.getId())
            .orElseThrow(() -> new RuntimeException("No hay registro de empresa vinculado al usuario " + usuario.getId()));

        return empresa.getId(); 
    }

}
