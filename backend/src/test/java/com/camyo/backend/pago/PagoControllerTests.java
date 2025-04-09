package com.camyo.backend.pago;

import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.empresa.Empresa;
import com.camyo.backend.empresa.EmpresaService;
import com.camyo.backend.oferta.Oferta;
import com.camyo.backend.oferta.OfertaService;
import com.camyo.backend.suscripcion.PlanNivel;
import com.camyo.backend.suscripcion.Suscripcion;
import com.camyo.backend.suscripcion.SuscripcionService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Customer;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Subscription;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.SubscriptionCreateParams;

@ActiveProfiles("test")
@WebMvcTest(value = { PagoController.class }, properties = { "security.basic.enabled=false" })
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc(addFilters = false)
@ExtendWith(MockitoExtension.class)
public class PagoControllerTests {

    @MockitoBean
    private UsuarioService usuarioService;

    @MockitoBean
    private SuscripcionService suscripcionService;

    @MockitoBean
    private EmpresaService empresaService;

    @MockitoBean
    public OfertaService ofertaService; 

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MockMvc mockMvc;

    private static final String BASE_URL_PAGO = "/pago";

    Usuario u1;
    Usuario u2;
    Usuario u3;
    Usuario u4;
    Empresa e1;
    Empresa e2;
    Empresa e3;
    Camionero c1;
    Suscripcion s2;
    Suscripcion s3;
    SubscriptionCreateParams sp;
    Oferta o;

    @BeforeAll
    @Transactional
    void setup() {

        /*
         * Crea authority de empresa
         */

        Authorities authEmp = new Authorities();
        authEmp.setAuthority("EMPRESA");
        Authorities authCam = new Authorities();
        authCam.setAuthority("CAMIONERO");

        /*
         * Crea tres usuarios de empresa, cada uno con un plan propio
         */

        u1 = new Usuario();
        u1.setId(1);
        u1.setNombre("Empresa Gratis");
        u1.setTelefono("123456879");
        u1.setUsername("gratis");
        u1.setPassword("12");
        u1.setEmail("gratis@example.com");
        u1.setAuthority(authEmp);

        u2 = new Usuario();
        u2.setId(2);
        u2.setNombre("Empresa Básica");
        u2.setTelefono("111111111");
        u2.setUsername("basico");
        u2.setPassword("12");
        u2.setEmail("basico@example.com");
        u2.setAuthority(authEmp);

        u3 = new Usuario();
        u3.setId(3);
        u3.setNombre("Empresa Premium");
        u3.setTelefono("987654321");
        u3.setUsername("premium");
        u3.setPassword("12");
        u3.setEmail("premium@example.com");
        u3.setAuthority(authEmp);

        e1 = new Empresa();
        e1.setId(1);
        e1.setNif("123456789A");
        e1.setWeb("https://example.com");
        e1.setUsuario(u1);
        e1.setOfertas(new ArrayList<>());

        e2 = new Empresa();
        e2.setId(2);
        e2.setNif("123456789B");
        e2.setWeb("https://example.com");
        e2.setUsuario(u2);
        e2.setOfertas(new ArrayList<>());

        e3 = new Empresa();
        e3.setId(3);
        e3.setNif("123456789C");
        e3.setWeb("https://example.com");
        e3.setUsuario(u3);
        e3.setOfertas(new ArrayList<>());

        s2 = new Suscripcion();
        s2.setId(2);
        s2.setFechaInicio(LocalDate.now());
        s2.setFechaFin(null);
        s2.setEmpresa(e2);
        s2.setActiva(true);
        s2.setNivel(PlanNivel.BASICO);

        s3 = new Suscripcion();
        s3.setId(3);
        s3.setFechaInicio(LocalDate.now());
        s3.setFechaFin(LocalDate.now().plusMonths(1));
        s3.setEmpresa(e3);
        s3.setActiva(true);
        s3.setNivel(PlanNivel.PREMIUM);
        sp = SubscriptionCreateParams.builder().build();

        o = new Oferta();
        o.setId(1);
        o.setTitulo("Oferta para probar");
        o.setPromoted(false);
        o.setEmpresa(e1);
        
        u4 = new Usuario();
        u4.setId(4);
        u4.setNombre("Juan Sir Anuncios");
        u4.setTelefono("987654321");
        u4.setUsername("siranuncios");
        u4.setPassword("12");
        u4.setEmail("siranuncios@example.com");
        u4.setAuthority(authCam);

        c1 = new Camionero();
        c1.setUsuario(u4);
    }

    @Test
    void debeNoEncontrarCompra() throws Exception {
        Compra compra = null;
        Pago request = new Pago();
        request.setCompra(compra);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        mockMvc.perform(post(BASE_URL_PAGO + "/integrated", request)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
 
    @Test
    void debeModificarAnunciosIntegrada() throws Exception {
        Compra compra = Compra.ELIMINAR_ANUNCIOS;
        Pago request = new Pago();
        request.setCompra(compra);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
    @Test
    void debeModificarAnunciosMock() throws Exception {
        Compra compra = Compra.ELIMINAR_ANUNCIOS;
        Pago pago = new Pago();
        pago.setCompra(compra);

        Customer mockCustomer = Mockito.mock(Customer.class);
        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);

        // Mock llamadas no estáticas
        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        when(mockPaymentIntent.getClientSecret()).thenReturn("mock-stripe-api-key");

        // Mock llamadas estáticas de Stripe
        try (
            MockedStatic<CustomerUtil> clienteStatic = mockStatic(CustomerUtil.class);
            MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class);
        ) {

            paymentIntentStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                .thenReturn(mockPaymentIntent);
            clienteStatic.when(() -> CustomerUtil.findOrCreateCustomer(anyString(), anyString()))
                .thenReturn(mockCustomer);

            mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(pago)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("mock-stripe-api-key"));
        }
    }


    //Testing para crear subscripciones
    @Test
    void debeCrearSubscripciónBásicaIntegrada() throws Exception {
        Compra compra = Compra.BASICO;
        Pago pago = new Pago();
        pago.setCompra(compra);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u2);

        mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(pago)))
            .andExpect(status().isOk());
    }

    @Test
    void debeCrearSubscripciónIntegrada() throws Exception {
        Compra compra = Compra.PREMIUM;
        Pago pago = new Pago();
        pago.setCompra(compra);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u3);

        /*  
            Se puede revisar manualmente si ha creado una suscripción en Stripe (Debe estar incompleta)
        */
        mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pago)))
                .andExpect(status().isOk());
    }

    @Test
    void debeNoCrearSubscripción() throws Exception {
        Compra compra = Compra.PREMIUM;
        Pago pago = new Pago();
        pago.setCompra(compra);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u4);
        
        mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pago)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Compra inválida"));
    }

    @Test
    void debeCrearSubscripciónMock() throws Exception {
        Compra compra = Compra.BASICO;
        Pago pago = new Pago();
        pago.setCompra(compra);

        Subscription mockSubscription = Mockito.mock(Subscription.class);
        Invoice mockInvoice = Mockito.mock(Invoice.class);
        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);
        Customer mockCustomer = Mockito.mock(Customer.class);

        // Mock llamadas no estáticas
        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u2);
        when(mockSubscription.getLatestInvoiceObject()).thenReturn(mockInvoice);
        when(mockInvoice.getPaymentIntentObject()).thenReturn(mockPaymentIntent);
        when(mockPaymentIntent.getClientSecret()).thenReturn("mock-stripe-api-key");

        // Mock llamadas estáticas de Stripe
        try (
            MockedStatic<CustomerUtil> clienteStatic = mockStatic(CustomerUtil.class);
            MockedStatic<Subscription> subscriptionStatic = mockStatic(Subscription.class);
        ) {

            subscriptionStatic.when(() -> Subscription.create(any(SubscriptionCreateParams.class)))
                .thenReturn(mockSubscription);
            clienteStatic.when(() -> CustomerUtil.findOrCreateCustomer(anyString(), anyString()))
                .thenReturn(mockCustomer);

            mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pago)))
                .andExpect(status().isOk())
                .andExpect(content().string("mock-stripe-api-key"));
        }
    }

    // Testing para los patrocinios
    @Test
    void debeCrearPagoIntegrada() throws Exception {
        Compra compra = Compra.PATROCINAR;
        Pago pago = new Pago();
        pago.setCompra(compra);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u2);

        mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(pago)))
            .andExpect(status().isOk());
    }

    @Test
    void debeCrearPagoMock() throws Exception {
        Compra compra = Compra.PATROCINAR;
        Pago pago = new Pago();
        pago.setCompra(compra);

        Customer mockCustomer = Mockito.mock(Customer.class);
        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);

        // Mock llamadas no estáticas
        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        when(mockPaymentIntent.getClientSecret()).thenReturn("mock-stripe-api-key");

        // Mock llamadas estáticas de Stripe
        try (
            MockedStatic<CustomerUtil> clienteStatic = mockStatic(CustomerUtil.class);
            MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class);
        ) {

            paymentIntentStatic.when(() -> PaymentIntent.create(any(PaymentIntentCreateParams.class)))
                .thenReturn(mockPaymentIntent);
            clienteStatic.when(() -> CustomerUtil.findOrCreateCustomer(anyString(), anyString()))
                .thenReturn(mockCustomer);

            mockMvc.perform(post(BASE_URL_PAGO + "/integrated")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(pago)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("mock-stripe-api-key"));
        }
    }


    @Test
    void debeAplicaPatrocinioMock() throws Exception { 
        RequestDTO requestDto = new RequestDTO();
        requestDto.setIntent("client_secret");
        requestDto.setCompra(Compra.PATROCINAR);
        requestDto.setOfertaId(1);
         
        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        when(mockPaymentIntent.getStatus()).thenReturn(("succeeded"));
        when(ofertaService.obtenerOfertaPorId(requestDto.getOfertaId())).thenReturn(o);
        when(ofertaService.patrocinarOferta(requestDto.getOfertaId())).thenReturn(o);

        try (
            MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class);
        ) {

            paymentIntentStatic.when(() -> PaymentIntent.retrieve("client_secret")).thenReturn(mockPaymentIntent);

            mockMvc.perform(post(BASE_URL_PAGO + "/apply_compra")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDto)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Patrocinio aplicado con éxito"));
        }
    }

    @Test
    void debeAplicaSuscripciónMock() throws Exception { 
        RequestDTO requestDto = new RequestDTO();
        requestDto.setIntent("client_secret");
        requestDto.setCompra(Compra.PREMIUM);

        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        when(mockPaymentIntent.getStatus()).thenReturn(("succeeded"));
        when(empresaService.obtenerEmpresaPorUsuario(u1.getId())).thenReturn(Optional.of(e1));
        when(suscripcionService.asignarSuscripcion(e1.getId(), PlanNivel.valueOf(requestDto.getCompra().toString()), 9999)).thenReturn(null);

        try (
            MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class);
        ) {

            paymentIntentStatic.when(() -> PaymentIntent.retrieve("client_secret")).thenReturn(mockPaymentIntent);

            mockMvc.perform(post(BASE_URL_PAGO + "/apply_compra")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDto)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Suscripción aplicada con éxito"));
        }
    }

    @Test
    void debeAplicaEliminarAnunciosMock() throws Exception { 
        RequestDTO requestDto = new RequestDTO();
        requestDto.setIntent("client_secret");
        requestDto.setCompra(Compra.ELIMINAR_ANUNCIOS);

        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        when(mockPaymentIntent.getStatus()).thenReturn(("succeeded"));
        when(this.usuarioService.eliminarAnuncios(u1.getId())).thenReturn(u1);

        try (
            MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class);
        ) {

            paymentIntentStatic.when(() -> PaymentIntent.retrieve("client_secret")).thenReturn(mockPaymentIntent);

            mockMvc.perform(post(BASE_URL_PAGO + "/apply_compra")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDto)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Anuncios eliminados correctamente"));
        }
    }

    @Test
    void debeFallarAplicarCompraPorIntent() throws Exception { 
        RequestDTO requestDto = new RequestDTO();
        requestDto.setIntent("client_secret");
        requestDto.setCompra(Compra.ELIMINAR_ANUNCIOS);

        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        when(mockPaymentIntent.getStatus()).thenReturn("requires_payment_method");//real state of a intent

        try (
            MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class);
        ) {
            paymentIntentStatic.when(() -> PaymentIntent.retrieve("client_secret")).thenReturn(mockPaymentIntent);

            mockMvc.perform(post(BASE_URL_PAGO + "/apply_compra")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDto)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Acción denegada"));
        }
    }

    @Test
    void debeFallarAplicarCompraPorPermiso() throws Exception { 
        RequestDTO requestDto = new RequestDTO();
        requestDto.setIntent("client_secret");
        requestDto.setCompra(Compra.PATROCINAR);

        PaymentIntent mockPaymentIntent = Mockito.mock(PaymentIntent.class);

        when(this.usuarioService.obtenerUsuarioActual()).thenReturn(u1);
        when(mockPaymentIntent.getStatus()).thenReturn("succeeded");//real state of a intent

        try (
            MockedStatic<PaymentIntent> paymentIntentStatic = mockStatic(PaymentIntent.class);
        ) {
            paymentIntentStatic.when(() -> PaymentIntent.retrieve("client_secret")).thenReturn(mockPaymentIntent);

            mockMvc.perform(post(BASE_URL_PAGO + "/apply_compra")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestDto)))
                    .andExpect(status().isBadRequest())
                    .andExpect(content().string("Acción denegada"));
        }
    }
}
