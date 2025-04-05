package com.camyo.backend.auth.payload.request;

import java.time.LocalDate;
import java.util.Set;

import com.camyo.backend.camionero.Disponibilidad;
import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.camionero.Tarjetas;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

	@Size(max = 5242880, message = "El tamaño de la imagen no puede ser mayor que 5 MB")
	private byte[] foto;

	@Size(max = 5242880, message = "El tamaño del currículum no puede ser mayor que 5 MB")
	private byte[] curriculum;

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
