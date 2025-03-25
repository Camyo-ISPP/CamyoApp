package com.camyo.backend.oferta;

import java.time.LocalDate;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name= "cargas")
@Getter
@Setter
public class Carga{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name="mercancia")
    @NotBlank
    String mercancia;

    @Column(name="peso")
    @DecimalMin(value="0.0",inclusive=false, message="La carga no puede pesar igual o menos de 0.0 Kg")
    Double peso;

    @Column(name="origen")
    @NotBlank
    String origen;

    @Column(name="destino")
    @NotBlank
    String destino;

    @Column(name="distancia")
    @Min(value = 1, message="La distancia no puede ser negativa o cero")
    Integer distancia;

    @Column(name="inicio")
    @NotNull
    LocalDate inicio;

    @Column(name="fin_minimo")
    @NotNull
    LocalDate finMinimo;

    @Column(name="fin_maximo")
    @NotNull
    LocalDate finMaximo;


    @OneToOne(cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.PERSIST })
	@JoinColumn(name = "oferta_id", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Oferta oferta;
}
