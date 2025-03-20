package com.camyo.backend.auth.payload.request;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import com.camyo.backend.camionero.Disponibilidad;
import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.camionero.Tarjetas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestCamionero {
	
	@NotBlank
	private String username;

	@NotBlank
	private String password;

	@NotBlank
	private String email;
	
	@NotBlank
	private String nombre;
	
	@NotBlank
	private String telefono;
	
	@NotBlank
	private String localizacion;

	@NotNull
	private byte[] foto;

	private String descripcion;

	@NotBlank
	private String dni;

    @NotNull
    private Set<Licencia> licencias;

    @NotNull
    private Disponibilidad disponibilidad;

	@NotNull
	private Boolean tieneCAP;

	@NotNull
	private Integer experiencia;

	private LocalDate expiracionCAP;

	private Set<Tarjetas> tarjetasAutonomo;

}
