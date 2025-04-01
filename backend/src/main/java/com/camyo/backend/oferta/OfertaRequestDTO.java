package com.camyo.backend.oferta;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OfertaRequestDTO {
    private Oferta oferta;
    private Carga carga; 
    private Trabajo trabajo;
}

