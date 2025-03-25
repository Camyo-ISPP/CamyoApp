package com.camyo.backend.auth.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestEmpresa {

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

	private byte[] foto;

	private String descripcion;

    private String web;

    @NotBlank
	private String nif;
    
}
