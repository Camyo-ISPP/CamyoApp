package com.camyo.backend.pago;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;

import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mockito.MockedStatic;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.CustomerSearchResult;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerSearchParams;


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