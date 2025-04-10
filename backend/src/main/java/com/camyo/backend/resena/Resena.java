package com.camyo.backend.resena;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.camyo.backend.usuario.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "reseñas", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"comentador_id", "comentado_id"})
})
public class Resena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Max(value = 5)
    @Min(value = 0)
    private Integer valoracion;
    @Column(name="comentarios", length = 500)
    @Size(max = 500)
    private String comentarios;

    @ManyToOne
    @JoinColumn(name = "comentador_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario comentador;

    @ManyToOne
    @JoinColumn(name = "comentado_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Usuario comentado;
}