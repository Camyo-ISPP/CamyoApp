package com.camyo.backend.oferta;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<Oferta> obtenerOfertas() {
        return ofertaRepository.findAll();
    }

    @Transactional(readOnly=true)
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
		BeanUtils.copyProperties(oferta, toUpdate, "id");
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

}
