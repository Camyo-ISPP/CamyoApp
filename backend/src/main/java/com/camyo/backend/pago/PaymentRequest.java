package com.camyo.backend.pago;

import com.camyo.backend.suscripcion.PlanNivel;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

    private String customerName;

    private String customerEmail;

    private PlanNivel planNivel;

}
