package com.camyo.backend.pago;

import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.oferta.OfertaService;
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
import org.springframework.transaction.annotation.Transactional;
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
        private EmpresaService empresaService;

        @Autowired
        private OfertaService ofertaService;

        Dotenv dotenv = Dotenv.load();

        Set<Compra> suscripciones = Set.of(Compra.BASICO, Compra.PREMIUM);

        @PostMapping("/integrated")
        public ResponseEntity<String> integratedCheckout(@RequestBody Pago pago) throws StripeException {
                Stripe.apiKey = dotenv.get("STRIPE_API_KEY");
                String secret = null;

                if (pago.getCompra() == null) {
                        return new ResponseEntity<>("No hay ningún tipo de compra seleccionada", HttpStatus.BAD_REQUEST);
                }


                // Start by finding an existing customer record from Stripe or creating a new
                // one if needed
                Usuario cliente = usuarioService.obtenerUsuarioActual();
                Customer clienteStripe = CustomerUtil.findOrCreateCustomer(cliente.getEmail(), cliente.getNombre());

                String precio_id = null;

                // Integer empresaId = empresaService.obtenerEmpresaPorUsuario(cliente.getId()).get().getId();
                // suscripcionService.obtenerSuscripcionActiva(empresaId);

                switch (pago.getCompra()) {
                        case BASICO -> {
                                precio_id="price_1R7E7wIRKHnhkuSfhBa5XZVS";
                        }
                        case PREMIUM -> {
                                precio_id="price_1R7EAFIRKHnhkuSf4dEsT23W";
                        }
                        default -> {
                                precio_id=null;
                        }
                };

                if (pago.getCompra()==Compra.PATROCINAR && cliente.getAuthority().getAuthority()=="EMPRESA") {
                        // Create a PaymentIntent and send its client secret to the client
                        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                                .setAmount(499L)
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

                } else if (suscripciones.contains(pago.getCompra()) && cliente.getAuthority().getAuthority()=="EMPRESA"){

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

                } /*  else if (pago.getCompra()==Compra.ELIMINAR_ANUNCIOS) {
                        // Create a PaymentIntent and send its client secret to the client
                        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                                .setAmount(499L)
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
                }*/  else {
                        return new ResponseEntity<>("Compra inválida", HttpStatus.BAD_REQUEST);
                }
                return new ResponseEntity<>(secret, HttpStatus.OK);
        }

        @PostMapping("/apply_compra")
        public ResponseEntity<String> applyCompra(@RequestBody RequestDTO requestDto) throws StripeException {

                Stripe.apiKey = dotenv.get("STRIPE_API_KEY");
                Usuario usuarioActual = usuarioService.obtenerUsuarioActual();
                PaymentIntent paymentIntent = PaymentIntent.retrieve(requestDto.getIntent());

                if (paymentIntent.getStatus().equals("succeeded") && suscripciones.contains(requestDto.getCompra()) &&  usuarioActual.getAuthority().getAuthority()=="EMPRESA") {

                        suscripcionService.asignarSuscripcion(empresaService.obtenerEmpresaPorUsuario(usuarioActual.getId()).get().getId(), PlanNivel.valueOf(requestDto.getCompra().toString()), 9999);
                        return ResponseEntity.ok("Suscripción aplicada con éxito");

                } else if (paymentIntent.getStatus().equals("succeeded") && Compra.PATROCINAR == requestDto.getCompra() && requestDto.getOfertaId() != null 
                &&  usuarioActual.getAuthority().getAuthority()=="EMPRESA"){
                        // ofertaId puede ser null, por lo que la comprobación se realiza aquí
                        System.out.println( ofertaService.obtenerOfertaPorId(requestDto.getOfertaId()).getEmpresa().getUsuario().equals(usuarioActual));
                       
                        if (ofertaService.obtenerOfertaPorId(requestDto.getOfertaId()).getEmpresa().getUsuario().equals(usuarioActual)) {
                                ofertaService.patrocinarOferta(requestDto.getOfertaId());
                                return ResponseEntity.ok("Patrocinio aplicado con éxito");
                        }
                        
                } /*else if (paymentIntent.getStatus().equals("succeeded") && Compra.ELIMINAR_ANUNCIOS == requestDto.getCompra()){
                        Integer userId = usuarioService.obtenerUsuarioActual().getId();
                        usuarioService.eliminarAnuncios(userId);
                        return ResponseEntity.ok("Anuncios eliminados correctamente");
                }*/
                return ResponseEntity.badRequest().body("Acción denegada");
                
        }

}