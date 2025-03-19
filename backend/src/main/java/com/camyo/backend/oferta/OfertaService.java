package com.camyo.backend.oferta;

import java.util.HashSet;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroRepository;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaRepository;
import com.camyo.backend.exceptions.ResourceNotFoundException;

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
    public Oferta crearOfertaConCarga(OfertaConCargaDTO dto) {
        Oferta oferta = new Oferta();
        oferta.setTitulo(dto.getTitulo());
        oferta.setExperiencia(dto.getExperiencia());
        oferta.setLicencia(dto.getLicencia());
        oferta.setNotas(dto.getNotas());
        oferta.setEstado(dto.getEstado());
        oferta.setFechaPublicacion(dto.getFechaPublicacion());
        oferta.setSueldo(dto.getSueldo());

        Oferta ofertaGuardada = ofertaRepository.save(oferta);

        Carga carga = new Carga();
        carga.setMercancia(dto.getMercancia());
        carga.setPeso(dto.getPeso());
        carga.setOrigen(dto.getOrigen());
        carga.setDestino(dto.getDestino());
        carga.setDistancia(dto.getDistancia());
        carga.setInicio(dto.getInicio());
        carga.setFinMinimo(dto.getFinMinimo());
        carga.setFinMaximo(dto.getFinMaximo());

        carga.setOferta(ofertaGuardada);

        cargaRepository.save(carga);
        return ofertaGuardada;
    }

    @Transactional
    public Oferta crearOfertaConTrabajo(OfertaConTrabajoDTO dto) {

        Oferta oferta = new Oferta();
        oferta.setTitulo(dto.getTitulo());
        oferta.setExperiencia(dto.getExperiencia());
        oferta.setLicencia(dto.getLicencia());
        oferta.setNotas(dto.getNotas());
        oferta.setEstado(dto.getEstado());
        oferta.setFechaPublicacion(dto.getFechaPublicacion());
        oferta.setSueldo(dto.getSueldo());
        oferta = ofertaRepository.save(oferta);

        Trabajo trabajo = new Trabajo();
        trabajo.setFechaIncorporacion(dto.getFechaIncorporacion());
        trabajo.setJornada(dto.getJornada());
        trabajo.setOferta(oferta);
        trabajo = trabajoRepository.save(trabajo);

        return oferta;
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

}
