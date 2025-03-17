package com.camyo.backend.contactoDirecto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contacto")
public class ContactoController {

    @Autowired
    private WhatsAppService whatsAppService;

    @Autowired
    private EmailService emailService;

    // Endpoint para enviar mensaje de WhatsApp
    @PostMapping("/whatsapp")
    public ResponseEntity<String> enviarWhatsApp(@RequestBody WhatsAppRequest dto) {
        try {
            whatsAppService.enviarMensaje(dto.getNumeroDestino(), dto.getMensaje());
            return ResponseEntity.ok("Mensaje de WhatsApp enviado con éxito.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error al enviar mensaje de WhatsApp.");
        }
    }

    // Endpoint para enviar correo
    @PostMapping("/email")
    public ResponseEntity<String> enviarEmail(@RequestBody EmailRequest dto) {
        try {
            emailService.enviarCorreo(dto.getEmailDestino(), dto.getAsunto(), dto.getContenido());
            return ResponseEntity.ok("Correo enviado con éxito.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Error al enviar correo.");
        }
    }
}
