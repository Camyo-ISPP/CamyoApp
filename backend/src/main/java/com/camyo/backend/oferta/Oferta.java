package com.camyo.backend.oferta;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.format.annotation.DateTimeFormat;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.empresa.Empresa;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.camyo.backend.camionero.Licencia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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

    @Enumerated(EnumType.STRING)
    @Column(name="licencia")
    Licencia licencia;

    @Column(name="notas", length = 500)
    @NotBlank
    String notas;

    @Enumerated(EnumType.STRING)
    @Column(name="estado")
    private OfertaEstado estado;
    

    @Column(name="fecha_publicacion", columnDefinition = "DATETIME")
    @DateTimeFormat(pattern = "yyyy/MM/dd HH/mm")
    LocalDateTime fechaPublicacion;
    
    @Column(name="sueldo")
    @DecimalMin(value = "0.0", inclusive = false, message = "El sueldo debe ser mayor a 0")
    Double sueldo;

    @Column(name="localizacion")
    @NotBlank
    private String localizacion;

    @ManyToOne(optional=true)
    @JoinColumn(name = "camionero_id")
    private Camionero camionero;

    @ManyToMany
    @JoinTable(name = "aplicados", joinColumns = @JoinColumn(name = "oferta_id"), inverseJoinColumns = @JoinColumn(name = "camionero_id"))
    private Set<Camionero> aplicados;

    @ManyToMany
    @JoinTable(name = "rechazados", joinColumns = @JoinColumn(name = "oferta_id"), inverseJoinColumns = @JoinColumn(name = "camionero_id"))
    private Set<Camionero> rechazados;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;


    @Column(nullable = false)
    private Boolean promoted = false;
    

}
