package com.camyo.backend.empresa;

import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.validator.constraints.URL;

import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "empresas")
@Getter
@Setter
public class Empresa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "web")
	@NotBlank
    @URL
	private String web;

    @Column(name = "nif", unique = true)
    @NotBlank
    @Pattern(regexp = "^[A-Z]\\d{8}$")
    private String nif;

    @OneToOne(cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.MERGE })
	@JoinColumn(name = "usuario_id", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Usuario usuario;

    @JsonIgnore
    @OneToMany(mappedBy = "empresa", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Oferta> ofertas;
    
}
