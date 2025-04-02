package com.camyo.backend.oferta;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.exceptions.ResourceNotFoundException;

import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/ofertas")
@Tag(name = "Ofertas", description = "API para gestión de ofertas")
public class OfertaController {

    @Autowired
    private OfertaService ofertaService;

    @Autowired
    private TrabajoService trabajoService;

    @Autowired
    private CargaService cargaService;
    @Autowired
    private EmpresaService empresaService;
    

    @GetMapping("/recientes")
    public List<Oferta> obtenerUltimas10Ofertas() {
        return ofertaService.obtenerUltimas10Ofertas();
    }
    
    /**
     * GET: Listar todas las ofertas
     * 
     * @return Lista de todas las ofertas disponibles.
     */
    @GetMapping("/info")
    public List<OfertaConTodaInformacionDTO> obtenerOfertasConInformacion() {
        List<Oferta> ofertas = ofertaService.obtenerOfertas();
        return ofertas.stream().filter(o -> o.getEstado().equals(OfertaEstado.ABIERTA)).map(oferta -> {
            OfertaConTodaInformacionDTO dto = new OfertaConTodaInformacionDTO();
            dto.setId(oferta.getId());
            dto.setTitulo(oferta.getTitulo());
            dto.setExperiencia(oferta.getExperiencia());
            dto.setLicencia(oferta.getLicencia());
            dto.setNotas(oferta.getNotas());
            dto.setFechaPublicacion(oferta.getFechaPublicacion());
            dto.setSueldo(oferta.getSueldo());
            dto.setLocalizacion(oferta.getLocalizacion());
            dto.setPromoted(oferta.getPromoted() != null ? oferta.getPromoted() : false);
            dto.setTipoOferta(oferta.getTipoOferta());
            if (oferta.getEmpresa() != null && oferta.getEmpresa().getUsuario() != null) {
                dto.setNombreEmpresa(oferta.getEmpresa().getUsuario().getNombre());
            }
            if (oferta.getEmpresa() != null && oferta.getEmpresa().getUsuario() != null) {
                dto.setNombreEmpresa(oferta.getEmpresa().getUsuario().getNombre());
            }

            if (oferta.getTipoOferta().equals(TipoOferta.CARGA)) {
                Carga c = ofertaService.obtenerCarga(oferta.getId());
                dto.setMercancia(c.getMercancia());
                dto.setPeso(c.getPeso());
                dto.setOrigen(c.getOrigen());
                dto.setDestino(c.getDestino());
                dto.setDistancia(c.getDistancia());
                dto.setInicio(c.getInicio());
                dto.setFinMinimo(c.getFinMinimo());
                dto.setFinMaximo(c.getFinMaximo());
            } else {
                Trabajo t = ofertaService.obtenerTrabajo(oferta.getId());
                dto.setFechaIncorporacion(t.getFechaIncorporacion());
                dto.setJornada(t.getJornada());
            }
    
            return dto;
        }).toList();
    }

    /**
     * GET: Obtener oferta por ID
     * 
     * @param id ID de la oferta a consultar
     * @return Detalles de la oferta o error si no se encuentra.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Oferta> obtenerOfertaPorId(@PathVariable Integer id) {
        try {
            Oferta oferta = ofertaService.obtenerOfertaPorId(id);
            return ResponseEntity.ok(oferta);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST: Crear una nueva oferta
     * 
     * Permite crear una oferta y asignarle una empresa.
     * Se debe especificar si es de tipo 'CARGA' o 'TRABAJO'.
     * 
     * @param request DTO con los datos de la oferta, tipo y detalles adicionales.
     * @return Respuesta con la oferta creada o error en caso de fallo.
     */
    @PostMapping
    public ResponseEntity<?> crearOferta(@RequestBody OfertaRequestDTO request) {
        try {
            Empresa empresa = empresaService.obtenerEmpresaPorId(
                request.getOferta().getEmpresa().getId()
            );
            request.getOferta().setEmpresa(empresa);

            Oferta nuevaOferta = ofertaService.guardarOferta(request.getOferta());
    
            if (TipoOferta.CARGA.equals(request.getOferta().getTipoOferta()) && request.getCarga() != null) {
                request.getCarga().setOferta(nuevaOferta);
                cargaService.guardarCarga(request.getCarga());
            } else if (TipoOferta.TRABAJO.equals(request.getOferta().getTipoOferta()) && request.getTrabajo() != null) {
                request.getTrabajo().setOferta(nuevaOferta);
                trabajoService.guardarTrabajo(request.getTrabajo());
            } else {
                return ResponseEntity.badRequest()
                    .body("Tipo de oferta no válido o datos de carga/trabajo incompletos.");
            }
    
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaOferta);
    
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body("Empresa no encontrada.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error al crear la oferta: " + e.getMessage());
        }
    }
    


    /**
     * PUT: Actualizar una oferta existente
     *
     * Permite actualizar los detalles de una oferta y, si es necesario, actualizar su carga o trabajo asociado.
     *
     * @param id      ID de la oferta a actualizar.
     * @param request Datos actualizados de la oferta, incluyendo tipo de oferta (CARGA o TRABAJO).
     * @return Oferta actualizada correctamente o error si la oferta no existe.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarOferta(@PathVariable Integer id, @RequestBody OfertaRequestDTO request) {
        try {
            Oferta ofertaExistente = ofertaService.obtenerOfertaPorId(id);
            if (request.getOferta() != null && request.getOferta().getEmpresa() != null) {
                Empresa nuevaEmpresa = empresaService.obtenerEmpresaPorId(request.getOferta().getEmpresa().getId());
                ofertaExistente.setEmpresa(nuevaEmpresa);
            }

            if (request.getOferta() != null) {
                Oferta nuevaData = request.getOferta();
                if (nuevaData.getTitulo() != null) ofertaExistente.setTitulo(nuevaData.getTitulo());
                if (nuevaData.getLicencia() != null) ofertaExistente.setLicencia(nuevaData.getLicencia());
                if (nuevaData.getSueldo() != null) ofertaExistente.setSueldo(nuevaData.getSueldo());
                if (nuevaData.getNotas() != null) ofertaExistente.setNotas(nuevaData.getNotas());
            }
    
            Oferta ofertaActualizada = ofertaService.guardarOferta(ofertaExistente);
            if (TipoOferta.CARGA.equals(request.getOferta().getTipoOferta()) && request.getCarga() != null) {
                Carga cargaExistente = ofertaService.obtenerCarga(id);
                if (cargaExistente != null) {
                    cargaExistente.setOferta(ofertaActualizada);
                    cargaExistente.setPeso(request.getCarga().getPeso());
                    cargaService.guardarCarga(cargaExistente);
                } else {
                    request.getCarga().setOferta(ofertaActualizada);
                    cargaService.guardarCarga(request.getCarga());
                }
            } else if (TipoOferta.TRABAJO.equals(request.getOferta().getTipoOferta()) && request.getTrabajo() != null) {
                Trabajo trabajoExistente = ofertaService.obtenerTrabajo(id);
                if (trabajoExistente != null) {
                    trabajoExistente.setOferta(ofertaActualizada);
                    trabajoExistente.setJornada(request.getTrabajo().getJornada());
                    trabajoService.guardarTrabajo(trabajoExistente);
                } else {
                    request.getTrabajo().setOferta(ofertaActualizada);
                    trabajoService.guardarTrabajo(request.getTrabajo());
                }
            }
    
            return ResponseEntity.ok(ofertaActualizada);
    
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error al actualizar la oferta: " + e.getMessage());
        }
    }

    /**
     * DELETE: Eliminar una oferta
     * 
     * @param id ID de la oferta a eliminar
     * @return Respuesta sin contenido si se eliminó correctamente.
     */
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
     * GET: Obtener el 'Trabajo' asociado a una oferta concreta
     * 
     * Devuelve los detalles del trabajo vinculado a una oferta específica.
     * 
     * @param ofertaId ID de la oferta a consultar
     * @return Trabajo asociado a la oferta o error si no existe.
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
     * GET: Obtener la 'Carga' asociada a una oferta
     * 
     * Devuelve los detalles de la carga vinculada a una oferta.
     * 
     * @param ofertaId ID de la oferta a consultar
     * @return Carga asociada a la oferta o error si no existe.
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
     * PUT: Aplicar un camionero a una oferta
     * 
     * @param ofertaId    ID de la oferta a la que se aplicará
     * @param camioneroId ID del camionero que aplicará
     * @return Mensaje de éxito si la operación se completó correctamente.
     */
    @PutMapping("/{ofertaId}/aplicar/{camioneroId}")
    public ResponseEntity<Oferta> aplicarOferta(@PathVariable Integer ofertaId, @PathVariable Integer camioneroId) {
        try {
            Oferta oferta = ofertaService.aplicarOferta(ofertaId, camioneroId);
            return ResponseEntity.ok(oferta);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

     /**
     * PUT: Desaplicar un camionero de una oferta
     * 
     * @param ofertaId    ID de la oferta de la que se eliminará el camionero
     * @param camioneroId ID del camionero a desaplicar
     * @return Mensaje de éxito si la operación fue completada correctamente.
     */
    @PutMapping("/{ofertaId}/desaplicar/{camioneroId}")
    public ResponseEntity<Oferta> desaplicarOferta(@PathVariable Integer ofertaId, @PathVariable Integer camioneroId) {
        try {
            Oferta oferta = ofertaService.desaplicarOferta(ofertaId, camioneroId);
            return ResponseEntity.ok(oferta);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{ofertaId}/asignar/{camioneroId}")
    public ResponseEntity<Oferta> asignarOferta(@PathVariable Integer ofertaId, @PathVariable Integer camioneroId) {
        try {
            Oferta oferta = ofertaService.asignarOferta(ofertaId, camioneroId);
            return ResponseEntity.ok(oferta);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{ofertaId}/rechazar/{camioneroId}")
    public ResponseEntity<Oferta> rechazarOferta(@PathVariable Integer ofertaId, @PathVariable Integer camioneroId) {
        try {
            Oferta oferta = ofertaService.rechazarOferta(ofertaId, camioneroId);
            return ResponseEntity.ok(oferta);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET: Obtener las ofertas a las que ha aplicado un camionero, filtradas por estado y ordenadas por fecha de publicación.
     * 
     * @param camioneroId ID del camionero
     * @param estado (Opcional) Estado de la oferta (ABIERTA, CERRADA)
     * @return Lista de ofertas aplicadas filtradas y ordenadas.
     */
    @GetMapping("/camionero/{camioneroId}")
    public ResponseEntity<List<List<Oferta>>> obtenerOfertasPorCamionero(
            @PathVariable Integer camioneroId) {
        try {
            List<List<Oferta>> ofertasPorCategoria = ofertaService.obtenerOfertasPorCamionero(camioneroId);
            return ResponseEntity.ok(ofertasPorCategoria);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<Oferta>> obtenerOfertasPorEmpresa(
            @PathVariable Integer empresaId) {
        try {
            List<Oferta> ofertas = ofertaService.obtenerOfertasPorEmpresa(empresaId);
            return ResponseEntity.ok(ofertas);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    
    @PutMapping("/{ofertaId}/patrocinar")
    public ResponseEntity<?> patrocinarOferta(@PathVariable Integer ofertaId) {
        try {
            ofertaService.patrocinarOferta(ofertaId);
            return ResponseEntity.ok("Patrocinio activado correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{ofertaId}/desactivar-patrocinio")
    public ResponseEntity<?> desactivarPatrocinio(@PathVariable Integer ofertaId) {
        try {
            ofertaService.desactivarPatrocinio(ofertaId);
            return ResponseEntity.ok("Patrocinio desactivado correctamente.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    


}