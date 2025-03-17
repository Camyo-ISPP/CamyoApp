package com.camyo.backend.contactoDirecto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class WhatsAppService {

    @Value("${twilio.whatsappFrom}")
    private String whatsappFrom;   // "whatsapp:+14155238886" o similar


    @Value("${twilio.accountSid}")
    private String accountSid;

    @Value("${twilio.authToken}")
    private String authToken;

    public void enviarMensaje(String numeroDestino, String mensaje) {
        // Asegúrate de inicializar Twilio si no lo haces en un @Bean
        Twilio.init(accountSid, authToken);

        // numeroDestino debe ir con el formato "whatsapp:+34XXXX..."
        Message message = Message.creator(
                new PhoneNumber(numeroDestino),
                new PhoneNumber(whatsappFrom),
                mensaje
        ).create();
        System.out.println("Mensaje de WhatsApp enviado. SID: " + message.getSid());
    }
}
