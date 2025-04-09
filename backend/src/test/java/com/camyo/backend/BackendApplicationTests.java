package com.camyo.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Activa el perfil "test"
public class BackendApplicationTests {

    @BeforeAll
    static void loadEnv() {
        // Cargar variables de entorno desde .env
        Dotenv dotenv = Dotenv.load();
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
    }
 
    @Test
    void contextLoads() {
        // Prueba básica para verificar que el contexto se carga
    }
}
