package com.camyo.backend.contactoDirecto;

public class EmailRequest {
    private String emailDestino;
    private String asunto;
    private String contenido;

    // getters y setters
    public String getEmailDestino() {
        return emailDestino;
    }
    public void setEmailDestino(String emailDestino) {
        this.emailDestino = emailDestino;
    }
    public String getAsunto() {
        return asunto;
    }
    public void setAsunto(String asunto) {
        this.asunto = asunto;
    }
    public String getContenido() {
        return contenido;
    }
    public void setContenido(String contenido) {
        this.contenido = contenido;
    }
}
