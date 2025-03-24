package com.camyo.backend.pago;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestDTO {
    String intent;
    Compra compra;
}
