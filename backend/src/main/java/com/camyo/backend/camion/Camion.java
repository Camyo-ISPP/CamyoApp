package com.camyo.backend.camion;

import com.camyo.backend.camionero.Camionero;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class Camion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Pattern(message = "Escribo un formato de matrícula válido (las letras deben estar en mayúscula)",
                regexp = "^\\d{4}[A-Z]{3}$")
    private String matricula;

    @NotBlank
    private String modelo;

    private String foto;

    private String notas;

    @ManyToOne
    @JoinColumn(name = "camionero_id")
    private Camionero camionero;
}
