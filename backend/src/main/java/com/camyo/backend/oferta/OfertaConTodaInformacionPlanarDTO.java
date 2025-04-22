package com.camyo.backend.oferta;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.camyo.backend.camionero.Licencia;

import lombok.Getter;

@Getter
public class OfertaConTodaInformacionPlanarDTO {

    private final Integer id;
    private final TipoOferta tipoOferta;
    private final String localizacion;
    private final String nombreEmpresa;
    private final String titulo;
    private final Integer experiencia;
    private final Licencia licencia;
    private final String notas;
    private final LocalDateTime fechaPublicacion;
    private final Double sueldo;
    private final Boolean promoted;
    private final byte[] foto;
    private final Integer idUsuarioEmpresa;

    private final LocalDate fechaIncorporacion;
    private final Jornada jornada;

    private final String mercancia;
    private final Double peso;
    private final String origen;
    private final String destino;
    private final Integer distancia;
    private final LocalDate inicio;
    private final LocalDate finMinimo;
    private final LocalDate finMaximo;

    public OfertaConTodaInformacionPlanarDTO(
        Integer id,
        TipoOferta tipoOferta,
        String localizacion,
        String nombreEmpresa,
        String titulo,
        Integer experiencia,
        Licencia licencia,
        String notas,
        LocalDateTime fechaPublicacion,
        Double sueldo,
        Boolean promoted,
        byte[] foto,
        Integer idUsuarioEmpresa,
        LocalDate fechaIncorporacion,
        Jornada jornada,
        String mercancia,
        Double peso,
        String origen,
        String destino,
        Integer distancia,
        LocalDate inicio,
        LocalDate finMinimo,
        LocalDate finMaximo
    ) {
        this.id = id;
        this.tipoOferta = tipoOferta;
        this.localizacion = localizacion;
        this.nombreEmpresa = nombreEmpresa;
        this.titulo = titulo;
        this.experiencia = experiencia;
        this.licencia = licencia;
        this.notas = notas;
        this.fechaPublicacion = fechaPublicacion;
        this.sueldo = sueldo;
        this.promoted = promoted;
        this.foto = foto;
        this.idUsuarioEmpresa = idUsuarioEmpresa;
        this.fechaIncorporacion = fechaIncorporacion;
        this.jornada = jornada;
        this.mercancia = mercancia;
        this.peso = peso;
        this.origen = origen;
        this.destino = destino;
        this.distancia = distancia;
        this.inicio = inicio;
        this.finMinimo = finMinimo;
        this.finMaximo = finMaximo;
    }
}
