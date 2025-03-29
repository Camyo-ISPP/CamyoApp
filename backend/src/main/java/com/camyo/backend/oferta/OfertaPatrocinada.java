package com.camyo.backend.oferta;

import java.time.LocalDateTime;

import com.camyo.backend.empresa.Empresa;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "ofertas_patrocinadas")
@Getter
@Setter
public class OfertaPatrocinada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "oferta_id")
    private Oferta oferta;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PatrocinioStatus status;
}
