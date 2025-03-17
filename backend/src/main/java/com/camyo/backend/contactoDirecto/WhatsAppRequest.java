package com.camyo.backend.contactoDirecto;

public class WhatsAppRequest {
    private String numeroDestino;  // "whatsapp:+34XXXX..."
    private String mensaje;

    // getters y setters
    public String getNumeroDestino() {
        return numeroDestino;
    }
    public void setNumeroDestino(String numeroDestino) {
        this.numeroDestino = numeroDestino;
    }
    public String getMensaje() {
        return mensaje;
    }
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
