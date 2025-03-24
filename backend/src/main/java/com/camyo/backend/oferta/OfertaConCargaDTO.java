package com.camyo.backend.oferta;

import java.time.LocalDateTime;
import java.time.LocalDate;

import com.camyo.backend.camionero.Licencia;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfertaConCargaDTO {
    
    private String titulo;
    private Integer experiencia;
    private Licencia licencia;
    private String notas;
    private OfertaEstado estado;
    private LocalDateTime fechaPublicacion;
    private Double sueldo;


    private String mercancia;
    private Double peso;
    private String origen;
    private String destino;
    private Integer distancia;
    private LocalDate inicio;
    private LocalDate finMinimo;
    private LocalDate finMaximo;
}
