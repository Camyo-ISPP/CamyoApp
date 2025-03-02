package com.camyo.backend.oferta;

import java.time.LocalDateTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.camyo.backend.camionero.Camionero;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name= "ofertas")
@Getter
@Setter
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="titulo")
    @NotBlank
    String titulo;

    @Column(name="experiencia")
    @Min(value = 0, message="Los años de experiencia no pueden ser negativos")
    Integer experiencia;

    @Column(name="licencia")
    Licencia licencia;

    @Column(name="notas")
    @NotBlank
    String notas;

    @Column(name="estado")
    OfertaEstado estado;

    @Column(name="fecha_publicación")
    @DateTimeFormat(pattern = "yyyy/MM/dd HH/mm")
    LocalDateTime fechaPublicacion;
    
    @Column(name="sueldo")
    @DecimalMin(value = "0.0", inclusive = false, message = "El sueldo debe ser mayor a 0")
    Double sueldo;

    @ManyToOne
    @JoinColumn(name = "camionero_id")
    private Camionero camionero;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Camionero empresa;
}
