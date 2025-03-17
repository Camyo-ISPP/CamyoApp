package com.camyo.backend.oferta;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.SuscripcionService;

@Service
public class OfertaPatrocinadaService {

    private final OfertaPatrocinadaRepository ofertaPatrocinadaRepository;
    private final OfertaService ofertaService;
    private final EmpresaService empresaService;
    private final SuscripcionService suscripcionService;

    public OfertaPatrocinadaService(
        OfertaPatrocinadaRepository ofertaPatrocinadaRepository,
        OfertaService ofertaService,
        EmpresaService empresaService,
        SuscripcionService suscripcionService
    ) {
        this.ofertaPatrocinadaRepository = ofertaPatrocinadaRepository;
        this.ofertaService = ofertaService;
        this.empresaService = empresaService;
        this.suscripcionService = suscripcionService;
    }


    @Transactional
    public OfertaPatrocinada patrocinarOferta(Integer ofertaId, Integer empresaId, int duracionDias) {
        Oferta oferta = ofertaService.obtenerOfertaPorId(ofertaId);
        Empresa empresa = empresaService.obtenerEmpresaPorId(empresaId);

        PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(empresaId); 
        long patrociniosActivos = ofertaPatrocinadaRepository.countActiveByEmpresa(empresaId);

        switch (nivel) {
            case GRATIS:
                if (patrociniosActivos >= 1) {
                    throw new RuntimeException("La cuenta gratuita solo puede patrocinar 1 oferta a la vez.");
                }
                break;
            case BASIC:
                if (patrociniosActivos >= 5) { 
                    throw new RuntimeException("El plan BASIC solo permite patrocinar 5 ofertas a la vez.");
                }
                break;
            case PREMIUM:
                break;
            default:
                break;
        }

        var existente = ofertaPatrocinadaRepository.findActiveByOferta(ofertaId);
        if (existente.isPresent()) {
            throw new RuntimeException("Esta oferta ya está patrocinada actualmente.");
        }

        OfertaPatrocinada patrocinio = new OfertaPatrocinada();
        patrocinio.setOferta(oferta);
        patrocinio.setEmpresa(empresa);
        patrocinio.setFechaInicio(LocalDateTime.now());
        patrocinio.setFechaFin(LocalDateTime.now().plusDays(duracionDias));
        patrocinio.setStatus(PatrocinioStatus.ACTIVO);

        return ofertaPatrocinadaRepository.save(patrocinio);
    }

    @Transactional
    public void desactivarPatrocinio(Integer ofertaId) {
        OfertaPatrocinada patrocinada = ofertaPatrocinadaRepository
            .findActiveByOferta(ofertaId)
            .orElseThrow(() -> new ResourceNotFoundException("OfertaPatrocinada", "ofertaId", ofertaId));

        patrocinada.setStatus(PatrocinioStatus.CANCELADO);
        ofertaPatrocinadaRepository.save(patrocinada);
    }

    @Transactional(readOnly = true)
    public List<OfertaPatrocinada> listarPatrociniosActivosDeEmpresa(Integer empresaId) {
        return ofertaPatrocinadaRepository.findByEmpresaActivos(empresaId);
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expirarPatrocinios() {
        LocalDateTime ahora = LocalDateTime.now();
        List<OfertaPatrocinada> vencidos = ofertaPatrocinadaRepository.findExpiredButActive(ahora);

        for (OfertaPatrocinada p : vencidos) {
            p.setStatus(PatrocinioStatus.EXPIRADO);
        }
        ofertaPatrocinadaRepository.saveAll(vencidos);
    }
}
