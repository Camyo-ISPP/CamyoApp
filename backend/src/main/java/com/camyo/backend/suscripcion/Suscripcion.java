package com.camyo.backend.suscripcion;

import java.time.LocalDate;

import com.camyo.backend.empresa.Empresa;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "suscripciones")
public class Suscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.MERGE }, orphanRemoval = true)
    @JoinColumn(name = "empresa_id", referencedColumnName = "id")
    private Empresa empresa;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanNivel nivel;      // GRATIS, BASICO, PREMIUM

    @NotNull
    @Column(name="fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    // Solo será nula si la suscripción es GRATIS y no queremos fecha fin
    @Column(name="fecha_fin")
    private LocalDate fechaFin;

    @NotNull
    @Column(nullable = false)
    private Boolean activa;
}
