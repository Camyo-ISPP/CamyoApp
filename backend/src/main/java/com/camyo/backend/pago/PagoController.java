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
import com.stripe.model.Price;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.SubscriptionCreateParams;
import com.stripe.param.SubscriptionCreateParams.PaymentSettings.SaveDefaultPaymentMethod;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

        String STRIPE_API_KEY = System.getenv().get("STRIPE_API_KEY");

        Set<Compra> suscripciones = Set.of(Compra.BASICO, Compra.PREMIUM);

        @PostMapping("/integrated")
        public ResponseEntity<String> integratedCheckout(@RequestBody Pago pago) throws StripeException {

                Stripe.apiKey = STRIPE_API_KEY;

                String clientBaseURL = "http://localhost:8081";

                String secret = null;

                // Start by finding an existing customer record from Stripe or creating a new
                // one if needed
                // Usuario cliente = usuarioService.obtenerUsuarioActual();
        // Customer clienteStripe = CustomerUtil.findOrCreateCustomer(cliente.getEmail(), cliente.getNombre());
                Customer clienteStripe = CustomerUtil.findOrCreateCustomer("emp.piloto1@example.com", "Empresa Piloto");

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
                System.out.println(requestDto);
                Stripe.apiKey = Stripe.apiKey = STRIPE_API_KEY;

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

                Stripe.apiKey = STRIPE_API_KEY;
                PaymentIntent paymentIntent = PaymentIntent.retrieve(requestDto.getIntent());

                if (paymentIntent.getStatus().equals("succeeded") || suscripciones.contains(requestDto.getCompra())) {

                        Usuario usuarioActual = usuarioService.obtenerUsuarioActual();
                        suscripcionService.asignarSuscripcion(empresaService.obtenerEmpresaPorUsuario(usuarioActual.getId()).get().getId(), PlanNivel.valueOf(requestDto.getCompra().toString()), 9999);
                        return ResponseEntity.ok("Suscripción aplicada con éxito");

                } else if (paymentIntent.getStatus().equals("succeeded") || Compra.PATROCINAR == requestDto.getCompra()){

                        //patrocinioService.patrocinarOferta(ofertaId, 99999);
                        return ResponseEntity.ok("Compra aplicada con éxito");
                
                } else {
                        return ResponseEntity.badRequest().build();
                }
        }

        @PostMapping("/create-checkout-session")
        String hostedCheckout() throws StripeException {

                Stripe.apiKey = STRIPE_API_KEY;
                String clientBaseURL = System.getenv().get("CLIENT_BASE_URL");

                // Usuario cliente = usuarioService.obtenerUsuarioActual();
                Customer clienteStripe = CustomerUtil.findOrCreateCustomer("test@example.com", "Dane Joe");

                // Next, create a checkout session by adding the details of the checkout
        SessionCreateParams.Builder paramsBuilder =
                SessionCreateParams.builder()
                                .setMode(SessionCreateParams.Mode.PAYMENT)
                                .setCustomer(clienteStripe.getId())
                                .setSuccessUrl(clientBaseURL + "/success?session_id={CHECKOUT_SESSION_ID}")
                                .setCancelUrl(clientBaseURL + "/failure");

                // Create a PaymentIntent and send its client secret to the client
                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                                .setAmount(1000L)
                                .setCurrency("eur")
                                .setCustomer(clienteStripe.getId())
                                .setAutomaticPaymentMethods(
                                                PaymentIntentCreateParams.AutomaticPaymentMethods
                                                                .builder()
                                                                .setEnabled(true)
                                                                .build())
                                .build();

                PaymentIntent paymentIntent = PaymentIntent.create(params);
                PriceCreateParams pcparams = PriceCreateParams.builder()
                                .setCurrency("eur")
                                .setUnitAmount(1000L)
                                .setRecurring(
                                                PriceCreateParams.Recurring.builder()
                                                                .setInterval(PriceCreateParams.Recurring.Interval.MONTH)
                .build()
                )
                                .setProductData(
                PriceCreateParams.ProductData.builder().setName("Plan").build()
                )
                                .build();

                Price price = Price.create(pcparams);

                // Send the client secret from the payment intent to the client
                // return paymentIntent.getClientSecret();

        SessionCreateParams scparams =
        SessionCreateParams.builder()
                                .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
                                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                                .setReturnUrl("https://example.com")
                                .addLineItem(
                                                SessionCreateParams.LineItem.builder()
                                                                .setQuantity(1L)
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                                                                .setPrice(price.getId())
                                                                .build())
                                .build();

                Session session = Session.create(scparams);
                // getRawJsonObject().getAsJsonPrimitive("client_secret").getAsString()
                Map<String, String> map = new HashMap();
                map.put("clientSecret", session.toJson());

                return session.toJson();
        }


        @PostMapping("/subscripcion")
        String newSubscription(@RequestBody PaymentRequest PaymentRequest) throws StripeException {

                Stripe.apiKey = STRIPE_API_KEY;

                String clientBaseURL = "http://localhost:8081";

                Usuario cliente = usuarioService.obtenerUsuarioActual();
                Customer clienteStripe = CustomerUtil.findOrCreateCustomer(cliente.getEmail(), cliente.getNombre());

                Long planPrecio = switch (PaymentRequest.getPlanNivel()) {
                        case GRATIS -> 000L;
                        case BASICO -> 2499L;
                        case PREMIUM -> 4999L;
                };

                SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                                .setCustomer(clienteStripe.getId())
                                .setUiMode(SessionCreateParams.UiMode.EMBEDDED)
                .setReturnUrl(clientBaseURL+ "/compra?session_id={CHECKOUT_SESSION_ID}");

                paramsBuilder.addLineItem(
                                SessionCreateParams.LineItem.builder()
                                                .setQuantity(1L)
                                                .setPriceData(
                                                                PriceData.builder()
                                                                                .setProductData(
                                                PriceData.ProductData.builder()
                                                        .setName(PaymentRequest.getPlanNivel().toString())
                                                                                                                .build())
                                                                                .setCurrency("eur")
                                                                                .setUnitAmount(planPrecio)
                                        .setRecurring(PriceData.Recurring.builder()
                                                .setInterval(PriceData.Recurring.Interval.MONTH).build())
                                                                                .build())
                                                .build());

                Session session = Session.create(paramsBuilder.build());

                return session.toJson();
        }

}