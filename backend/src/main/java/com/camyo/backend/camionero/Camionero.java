package com.camyo.backend.camionero;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.format.annotation.DateTimeFormat;

import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.usuario.Usuario;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "camioneros")
@Getter
@Setter
public class Camionero{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Min(value = 0)
    private Integer experiencia;

    @Column(name = "dni", unique = true)
    @NotBlank
    @Pattern(regexp = "^\\d{8}[A-Z]$")
    private String dni;

    @NotEmpty
    @ElementCollection
    private Set<Licencia> licencias;

    @NotNull
    private Disponibilidad disponibilidad;

    @NotNull
    private Boolean tieneCAP;

    @DateTimeFormat(pattern = "dd/MM/yyyy")
    private LocalDate expiracionCAP;

    @ElementCollection
    private Set<Tarjetas> tarjetasAutonomo;

    @Lob
    private byte[] curriculum;

    @OneToOne(cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.MERGE })
	@JoinColumn(name = "usuario_id", referencedColumnName = "id")
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Usuario usuario;

    @JsonIgnore
    @OneToMany(mappedBy = "camionero", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Oferta> asignadas;


}
