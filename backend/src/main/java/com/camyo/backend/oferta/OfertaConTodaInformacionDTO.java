package com.camyo.backend.oferta;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.camyo.backend.camionero.Licencia;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class OfertaConTodaInformacionDTO {

    private Integer id;
    private TipoOferta tipoOferta;
    private String localizacion;
    private String nombreEmpresa;
    private String titulo;
    private Integer experiencia;
    private Licencia licencia;
    private String notas;
    private LocalDateTime fechaPublicacion;
    private Double sueldo;
    private Boolean promoted;
    private byte[] foto;

    private LocalDate fechaIncorporacion;
    private Jornada jornada;

    private String mercancia;
    private Double peso;
    private String origen;
    private String destino;
    private Integer distancia;
    private LocalDate inicio;
    private LocalDate finMinimo;
    private LocalDate finMaximo;


}
