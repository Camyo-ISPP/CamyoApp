package com.camyo.backend.oferta;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.Licencia;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class OfertaConTodaInformacionDTO {

    private Integer id;
    private String tipoOferta;
    private String localizacion;
    private Camionero camionero;
    private Set<Camionero> aplicados;
    private Set<Camionero> rechazados;
    private String nombreEmpresa;
    private String titulo;
    private Integer experiencia;
    private Licencia licencia;
    private String notas;
    private OfertaEstado estado;
    private LocalDateTime fechaPublicacion;
    private Double sueldo;

    private LocalDate fechaIncorporacion;
    private Jornada jornada;

    private String mercancia;
    private Double peso;
    private String origen;
    private String destino;
    private Integer distancia;
    private LocalDateTime inicio;
    private LocalDateTime finMinimo;
    private LocalDateTime finMaximo;


}
