package com.camyo.backend.auth.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditRequestEmpresa {

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

	private String descripcion;

    private String web;

    @NotBlank
	private String nif;
    
}
