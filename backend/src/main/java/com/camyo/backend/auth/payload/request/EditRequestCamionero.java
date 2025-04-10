package com.camyo.backend.auth.payload.request;

import java.time.LocalDate;
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
public class EditRequestCamionero {

	@NotBlank
	private String email;
	
	@NotBlank
	private String nombre;
	
	@NotBlank
	private String telefono;
	
	@NotBlank
	private String localizacion;

	private byte[] foto;

	private byte[] curriculum;

	private String descripcion;

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
