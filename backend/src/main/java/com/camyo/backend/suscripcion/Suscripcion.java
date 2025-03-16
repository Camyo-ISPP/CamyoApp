package com.camyo.backend.suscripcion;

import java.time.LocalDate;
import com.camyo.backend.empresa.Empresa;

import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    private PlanNivel nivel;      // GRATIS, BASIC, PREMIUM

    private LocalDate fechaInicio;
    private LocalDate fechaFin;   // Si tus planes caducan
    private Boolean activa;       // Indica si la suscripción está en uso
}
