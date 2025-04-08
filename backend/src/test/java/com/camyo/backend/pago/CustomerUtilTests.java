package com.camyo.backend.pago;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mockStatic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.mockito.MockedStatic;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.camyo.backend.camionero.Camionero;
import com.camyo.backend.camionero.CamioneroService;
import com.camyo.backend.camionero.Disponibilidad;
import com.camyo.backend.camionero.Licencia;
import com.camyo.backend.resena.Resena;
import com.camyo.backend.resena.ResenaService;
import com.camyo.backend.usuario.Authorities;
import com.camyo.backend.usuario.AuthoritiesService;
import com.camyo.backend.usuario.Usuario;
import com.camyo.backend.usuario.UsuarioService;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.CustomerSearchResult;
import com.stripe.model.Subscription;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerSearchParams;
import com.stripe.param.SubscriptionCreateParams;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = {CustomerUtil.class}) // Load only the required configuration
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class CustomerUtilTests {


    @BeforeAll
    @Transactional
    void setup(){

    }

    @Test
    void debeEncontrarClientePorEmailMock() throws StripeException {
        String email = "cliente@example.com";
        Customer mockCliente = mock(Customer.class);
        CustomerSearchResult mockBusqueda = mock(CustomerSearchResult.class);

        try (MockedStatic<Customer> clienteStatic = mockStatic(Customer.class)) {

            clienteStatic.when(() -> Customer.search(any(CustomerSearchParams.class)))
                          .thenReturn(mockBusqueda);

            when(mockBusqueda.getData()).thenReturn(List.of(mockCliente));

            Customer result = CustomerUtil.findCustomerByEmail(email);
            assertEquals(mockCliente, result);
        }
    }

	@Test
    void debeNoEncontrarClientePorEmailMock() throws StripeException {
        String email = "cliente@example.com";
        CustomerSearchResult mockBusqueda = mock(CustomerSearchResult.class);

        try (MockedStatic<Customer> clienteStatic = mockStatic(Customer.class)) {

            clienteStatic.when(() -> Customer.search(any(CustomerSearchParams.class)))
                          .thenReturn(mockBusqueda);

            when(mockBusqueda.getData()).thenReturn(List.of());

            Customer result = CustomerUtil.findCustomerByEmail(email);
            assertEquals(null, result);
        }
    }

    @Test
    void debeCrearNuevoClienteSiNoExisteMock() throws StripeException {
        String email = "nuevo@example.com";
        String name = "Nuevo Cliente";
        Customer mockCliente = mock(Customer.class);
        CustomerSearchResult mockBusqueda = mock(CustomerSearchResult.class);

        try (MockedStatic<Customer> clienteStatic = mockStatic(Customer.class)) {

            clienteStatic.when(() -> Customer.search(any(CustomerSearchParams.class)))
                .thenReturn(mockBusqueda);

            when(mockBusqueda.getData()).thenReturn(List.of());

            clienteStatic.when(() -> Customer.create(any(CustomerCreateParams.class)))
                .thenReturn(mockCliente);

            Customer result = CustomerUtil.findOrCreateCustomer(email, name);
            assertEquals(mockCliente, result);
        }
    }

    @Test
    void debeEncontrarClienteExistenteMock() throws StripeException {
        String email = "cliente@example.com";
        String name = "Cliente Existente";
        Customer mockCliente = mock(Customer.class);
        CustomerSearchResult mockBusqueda = mock(CustomerSearchResult.class);

        try (MockedStatic<Customer> clienteStatic = mockStatic(Customer.class)) {

            clienteStatic.when(() -> Customer.search(any(CustomerSearchParams.class)))
                .thenReturn(mockBusqueda);

            when(mockBusqueda.getData()).thenReturn(List.of(mockCliente));

            Customer result = CustomerUtil.findOrCreateCustomer(email, name);
            assertEquals(mockCliente, result);
        }
    }
}