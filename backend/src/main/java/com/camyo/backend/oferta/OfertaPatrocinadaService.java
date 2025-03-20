package com.camyo.backend.oferta;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.configuration.services.UserDetailsImpl;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaRepository;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioRepository;

@Service
public class OfertaPatrocinadaService {

    private final OfertaPatrocinadaRepository ofertaPatrocinadaRepository;
    private final OfertaService ofertaService;
    private final EmpresaService empresaService;
    private final SuscripcionService suscripcionService;
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;

    public OfertaPatrocinadaService(
        OfertaPatrocinadaRepository ofertaPatrocinadaRepository,
        OfertaService ofertaService,
        EmpresaService empresaService,
        SuscripcionService suscripcionService,
        EmpresaRepository empresaRepository,
        UsuarioRepository usuarioRepository
    ) {
        this.ofertaPatrocinadaRepository = ofertaPatrocinadaRepository;
        this.ofertaService = ofertaService;
        this.empresaService = empresaService;
        this.suscripcionService = suscripcionService;
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public OfertaPatrocinada patrocinarOferta(Integer ofertaId, int duracionDias) {
        Integer empresaIdAuth = getEmpresaIdFromToken();
        Empresa empresa = empresaService.obtenerEmpresaPorId(empresaIdAuth);
        Oferta oferta = ofertaService.obtenerOfertaPorId(ofertaId);

        PlanNivel nivel = suscripcionService.obtenerNivelSuscripcion(empresaIdAuth);
        long patrociniosActivos = ofertaPatrocinadaRepository.countActiveByEmpresa(empresaIdAuth);

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

        Integer empresaIdAuth = getEmpresaIdFromToken();

        if (!patrocinada.getEmpresa().getId().equals(empresaIdAuth)) {
            throw new RuntimeException("No tienes permiso para desactivar esta oferta patrocinada");
        }

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
