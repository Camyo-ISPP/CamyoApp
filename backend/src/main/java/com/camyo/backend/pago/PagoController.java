package com.camyo.backend.pago;

import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.oferta.OfertaPatrocinadaService;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Subscription;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.SubscriptionCreateParams;
import com.stripe.param.SubscriptionCreateParams.PaymentSettings.SaveDefaultPaymentMethod;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Arrays;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.cdimascio.dotenv.Dotenv;

@RestController
@RequestMapping("/pago")
@CrossOrigin(origins = "http://localhost:8081")
@Tag(name = "Pagos", description = "API para gestión de pagos")
public class PagoController {

        @Autowired
        private UsuarioService usuarioService;

        @Autowired
        private SuscripcionService suscripcionService;

        @Autowired
        private OfertaPatrocinadaService patrocinioService;

        @Autowired
        private EmpresaService empresaService;

        Dotenv dotenv = Dotenv.load();

        Set<Compra> suscripciones = Set.of(Compra.BASICO, Compra.PREMIUM);

        @PostMapping("/integrated")
        public ResponseEntity<String> integratedCheckout(@RequestBody Pago pago) throws StripeException {
                Stripe.apiKey = dotenv.get("STRIPE_API_KEY");
                String clientBaseURL = "http://localhost:8081";
                String secret = null;

                // Start by finding an existing customer record from Stripe or creating a new
                // one if needed
                Usuario cliente = usuarioService.obtenerUsuarioActual();
                Customer clienteStripe = CustomerUtil.findOrCreateCustomer(cliente.getEmail(), cliente.getNombre());

                Long planPrecio = 0L;
                String precio_id = null;
                switch (pago.getCompra()) {
                        case BASICO -> {
                                planPrecio=2499L;
                                precio_id="price_1R44WZC8z1doGFyHeIuqQXe6";
                        }
                        case PREMIUM -> {
                                planPrecio=2499L;
                                precio_id="price_1R44a0C8z1doGFyH9z0geWHE";
                        }
                        default -> {
                                planPrecio=200L;
                                precio_id=null;
                        }
                };

                if (pago.getCompra()==Compra.PATROCINAR) {
                        // Create a PaymentIntent and send its client secret to the client
                        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                                .setAmount(500L)
                                .setCurrency("eur")
                                .setCustomer(clienteStripe.getId())
                                .setAutomaticPaymentMethods(
                                        PaymentIntentCreateParams.AutomaticPaymentMethods
                                                .builder()
                                                .setEnabled(true)
                                                .build())
                                .build();

                        PaymentIntent paymentIntent = PaymentIntent.create(params);

                        secret = paymentIntent.getClientSecret();

                } else if (suscripciones.contains(pago.getCompra())){

                        SubscriptionCreateParams.PaymentSettings paymentSettings = SubscriptionCreateParams.PaymentSettings
                                .builder()
                                .setSaveDefaultPaymentMethod(SaveDefaultPaymentMethod.ON_SUBSCRIPTION)
                                .build();

                        SubscriptionCreateParams subCreateParams = SubscriptionCreateParams
                                .builder()
                                .setCustomer(clienteStripe.getId())
                                .addItem(SubscriptionCreateParams
                                        .Item.builder()
                                        .setPrice(precio_id)
                                        .build())
                                .setPaymentSettings(paymentSettings)
                                .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
                                .addAllExpand(Arrays.asList("latest_invoice.payment_intent"))
                                .build();
                          
                        Subscription subscription = Subscription.create(subCreateParams);

                        secret = subscription.getLatestInvoiceObject().getPaymentIntentObject().getClientSecret();

                } else {
                        return new ResponseEntity<>("Este tipo de compra no existe", HttpStatus.FORBIDDEN);
                }
                return new ResponseEntity<>(secret, HttpStatus.OK);
        }

        @PostMapping("/apply_subscription")
        public ResponseEntity<String> applySubscription(@RequestBody RequestDTO requestDto) throws StripeException {
                Stripe.apiKey = dotenv.get("STRIPE_API_KEY");

                PaymentIntent paymentIntent = PaymentIntent.retrieve(requestDto.getIntent());
                if (paymentIntent.getStatus().equals("succeeded")) {
                        Usuario usuarioActual = usuarioService.obtenerUsuarioActual();
                suscripcionService.asignarSuscripcion(empresaService.obtenerEmpresaPorUsuario(usuarioActual.getId()).get().getId(), PlanNivel.valueOf(requestDto.getCompra().toString()), null);
                        return ResponseEntity.ok("Suscripción aplicada con éxito");
                } else {
                        return ResponseEntity.badRequest().build();
                }
        }

        @PostMapping("/apply_compra")
        public ResponseEntity<String> applyCompra(@RequestBody RequestDTO requestDto) throws StripeException {

                Stripe.apiKey = dotenv.get("STRIPE_API_KEY");
                PaymentIntent paymentIntent = PaymentIntent.retrieve(requestDto.getIntent());

                if (paymentIntent.getStatus().equals("succeeded") && suscripciones.contains(requestDto.getCompra())) {

                        Usuario usuarioActual = usuarioService.obtenerUsuarioActual();
                        suscripcionService.asignarSuscripcion(empresaService.obtenerEmpresaPorUsuario(usuarioActual.getId()).get().getId(), PlanNivel.valueOf(requestDto.getCompra().toString()), 9999);
                        return ResponseEntity.ok("Suscripción aplicada con éxito");

                } else if (paymentIntent.getStatus().equals("succeeded") && Compra.PATROCINAR == requestDto.getCompra()){

                        //patrocinioService.patrocinarOferta(ofertaId, 99999);
                        return ResponseEntity.ok("Compra aplicada con éxito");
                
                } else {
                        return ResponseEntity.badRequest().build();
                }
        }

}