package com.camyo.backend.oferta;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.camyo.backend.exceptions.ResourceNotFoundException;

@RestController
@RequestMapping("/api/ofertas")
@CrossOrigin(origins = "http://localhost:3000")
public class OfertaController {

    @Autowired
    private OfertaService ofertaService;

    @Autowired
    private TrabajoService trabajoService;

    @Autowired
    private CargaService cargaService;

    // GET: listar todas las ofertas
    @GetMapping
    public List<Oferta> obtenerOfertas() {
        return ofertaService.obtenerOfertas();
    }

    // GET: obtener oferta por ID
    @GetMapping("/{id}")
    public ResponseEntity<Oferta> obtenerOfertaPorId(@PathVariable Integer id) {
        try {
            Oferta oferta = ofertaService.obtenerOfertaPorId(id);
            return ResponseEntity.ok(oferta);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET: ofertas “generales” 
    @GetMapping("/generales")
    public List<Oferta> obtenerOfertasGenerales() {
        return ofertaService.obtenerOfertasPorTipo();
    }

    // GET: ofertas “cargas”
    @GetMapping("/cargas")
    public List<Oferta> obtenerOfertasCarga() {
        return ofertaService.obtenerOfertasCarga();
    }

    // POST: crear oferta
    @PostMapping
    public ResponseEntity<Oferta> crearOferta(@RequestBody Oferta oferta) {
        Oferta nuevaOferta = ofertaService.guardarOferta(oferta);
        return ResponseEntity.ok(nuevaOferta);
    }

    // PUT: actualizar oferta existente
    @PutMapping("/{id}")
    public ResponseEntity<Oferta> actualizarOferta(@PathVariable Integer id,
                                                   @RequestBody Oferta ofertaDetalles) {
        try {
            Oferta ofertaActualizada = ofertaService.modificarOferta(ofertaDetalles, id);
            return ResponseEntity.ok(ofertaActualizada);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE: eliminar oferta
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarOferta(@PathVariable Integer id) {
        try {
            ofertaService.obtenerOfertaPorId(id); 
            ofertaService.eliminarOferta(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }



    /**
     * GET: obtener el 'Trabajo' asociado a una oferta concreta
     */
    @GetMapping("/{ofertaId}/trabajo")
    public ResponseEntity<Trabajo> obtenerTrabajoDeOferta(@PathVariable Integer ofertaId) {
        try {
            Trabajo trabajo = ofertaService.obtenerTrabajo(ofertaId); 
            return ResponseEntity.ok(trabajo);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST: Crear un 'Trabajo' y asociarlo a una oferta existente
     */
    @PostMapping("/{ofertaId}/trabajo")
    public ResponseEntity<Trabajo> crearTrabajoParaOferta(@PathVariable Integer ofertaId,
                                                          @RequestBody Trabajo trabajo) {
        try {
            Oferta oferta = ofertaService.obtenerOfertaPorId(ofertaId);

            trabajo.setOferta(oferta);

            Trabajo trabajoGuardado = trabajoService.guardarTrabajo(trabajo);
            return ResponseEntity.ok(trabajoGuardado);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT: Actualizar un 'Trabajo' asociado a una oferta
     */
    @PutMapping("/{ofertaId}/trabajo")
    public ResponseEntity<Trabajo> actualizarTrabajoDeOferta(@PathVariable Integer ofertaId,
                                                             @RequestBody Trabajo trabajoDetalles) {
        try {
            Oferta oferta = ofertaService.obtenerOfertaPorId(ofertaId);

            Trabajo trabajoActual = ofertaService.obtenerTrabajo(ofertaId); 
            trabajoActual.setFechaIncorporacion(trabajoDetalles.getFechaIncorporacion());
            trabajoActual.setJornada(trabajoDetalles.getJornada());

            Trabajo trabajoActualizado = trabajoService.guardarTrabajo(trabajoActual);
            return ResponseEntity.ok(trabajoActualizado);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE: Eliminar el 'Trabajo' asociado a la oferta
     */
    @DeleteMapping("/{ofertaId}/trabajo")
    public ResponseEntity<Void> eliminarTrabajoDeOferta(@PathVariable Integer ofertaId) {
        try {
            ofertaService.obtenerOfertaPorId(ofertaId);

            Trabajo trabajo = ofertaService.obtenerTrabajo(ofertaId);

            trabajoService.eliminarTrabajo(trabajo.getId());
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }


    /**
     * GET: obtener la 'Carga' asociada a una oferta
     */
    @GetMapping("/{ofertaId}/carga")
    public ResponseEntity<Carga> obtenerCargaDeOferta(@PathVariable Integer ofertaId) {
        try {
            Carga carga = ofertaService.obtenerCarga(ofertaId);
            return ResponseEntity.ok(carga);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST: Crear 'Carga' y asociarla a una oferta
     */
    @PostMapping("/{ofertaId}/carga")
    public ResponseEntity<Carga> crearCargaParaOferta(@PathVariable Integer ofertaId,
                                                      @RequestBody Carga carga) {
        try {
            Oferta oferta = ofertaService.obtenerOfertaPorId(ofertaId);
            carga.setOferta(oferta);

            Carga cargaGuardada = cargaService.guardarCarga(carga);
            return ResponseEntity.ok(cargaGuardada);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT: Actualizar la 'Carga' de una oferta
     */
    @PutMapping("/{ofertaId}/carga")
    public ResponseEntity<Carga> actualizarCargaDeOferta(@PathVariable Integer ofertaId,
                                                         @RequestBody Carga cargaDetalles) {
        try {
            Oferta oferta = ofertaService.obtenerOfertaPorId(ofertaId);
            Carga cargaActual = ofertaService.obtenerCarga(ofertaId);

            cargaActual.setMercancia(cargaDetalles.getMercancia());
            cargaActual.setPeso(cargaDetalles.getPeso());
            cargaActual.setOrigen(cargaDetalles.getOrigen());
            cargaActual.setDestino(cargaDetalles.getDestino());
            cargaActual.setDistancia(cargaDetalles.getDistancia());
            cargaActual.setInicio(cargaDetalles.getInicio());
            cargaActual.setFinMinimo(cargaDetalles.getFinMinimo());
            cargaActual.setFinMaximo(cargaDetalles.getFinMaximo());

            Carga cargaActualizada = cargaService.guardarCarga(cargaActual);
            return ResponseEntity.ok(cargaActualizada);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE: Eliminar la 'Carga' de una oferta
     */
    @DeleteMapping("/{ofertaId}/carga")
    public ResponseEntity<Void> eliminarCargaDeOferta(@PathVariable Integer ofertaId) {
        try {
            ofertaService.obtenerOfertaPorId(ofertaId);
            Carga carga = ofertaService.obtenerCarga(ofertaId);
            cargaService.eliminarCarga(carga.getId());
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
