package com.camyo.backend.oferta;

import java.time.LocalDateTime;
import java.util.Set;

import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.camionero.Camionero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfertaCompletaDTO {

    private Integer id;
    private String titulo;
    private Integer experiencia;
    private Licencia licencia;
    private String notas;
    private OfertaEstado estado;
    private LocalDateTime fechaPublicacion;
    private Double sueldo;
    private String localizacion;
    private Camionero camionero;
    private Set<Camionero> aplicados;
    private Set<Camionero> rechazados;
    private String nombreEmpresa;
    private String tipoOferta;
}
