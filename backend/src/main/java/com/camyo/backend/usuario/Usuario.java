package com.camyo.backend.usuario;


import java.util.Set;
import com.camyo.backend.empresa.Empresa;
import jakarta.persistence.*;
import lombok.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@Entity
@Table(name = "usuario")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Size(max = 100, message = "El nombre no puede tener más de 100 caracteres")
    private String nombre;

    @Pattern(regexp = "\\d{9}", message = "El número de teléfono debe tener 9 dígitos")
    private String telefono;

    @Column(unique = true)
	  String username;
    
    @Column(unique = true)
    @Email
    private String email;

    @OneToMany(mappedBy = "usuario", cascade = { CascadeType.DETACH, CascadeType.REFRESH, CascadeType.PERSIST, CascadeType.REMOVE }, orphanRemoval = true)
    private Set<Reseña> reseñas;
    
    @Size(max = 200, message = "La localización no puede tener más de 200 caracteres")
    private String localizacion;

    @Column(length = 500)
    private String descripcion;

    @Lob
    private byte[] foto;
    
    private String password;

	@NotNull
	@ManyToOne(optional = false)
	@JoinColumn(name = "authority")
	Authorities authority;

    public Boolean hasAuthority(String auth) {
		return authority.getAuthority().equals(auth);
	}

	public Boolean hasAnyAuthority(String... authorities) {
		Boolean cond = false;
		for (String auth : authorities) {
			if (auth.equals(authority.getAuthority()))
				cond = true;
		}
		return cond;
	}

}
