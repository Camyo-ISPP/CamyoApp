package com.camyo.backend.configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DataInitializer {

        @Autowired
        private DataSource dataSource;

        @PostConstruct
        public void init() throws SQLException {
                try (Connection connection = dataSource.getConnection()) {
                        Statement statement = connection.createStatement();
                        statement.addBatch("INSERT IGNORE INTO authorities (id, authority) VALUES "
                                        + "(201, 'CAMIONERO'),"
                                        + "(202, 'EMPRESA')");
                        // Insert Users
                        statement.addBatch(
                                        "INSERT IGNORE INTO usuario (id, nombre, telefono, username, email, localizacion, descripcion, foto, password, authority) VALUES "
                                                        + "(201, 'cam_piloto1', '123456789', 'user1', 'user1@example.com', 'Sevilla, España', 'Trabajador Autonomo', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y',201),"
                                                        + "(202, 'cam_piloto2', '987654321', 'user2', 'user2@example.com', 'Barcelona, España', 'Camionero', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y',201),"
                                                        + "(203, 'cam_piloto3', '123454321', 'user3', 'user3@example.com', 'Vigo, España', 'Trabajador Autonomo', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y',201),"
                                                        + "(204, 'cam_piloto4', '987656789', 'user4', 'user4@example.com', 'Madrid, España', 'Camionero', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y',201),"
                                                        + "(205, 'cam_piloto5', '555666777', 'user5', 'user5@example.com', 'Valencia, España', 'EMPRESAPILOTO1', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y',202),"
                                                        + "(206, 'cam_piloto6', '111222333', 'user6', 'user6@example.com', 'Sevilla, España', 'EMPRESAPILOTO2', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y9',202),"
                                                        + "(207, 'cam_piloto7', '777666555', 'user7', 'user7@example.com', 'Alicante, España', 'EMPRESAPILOTO3', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y',202),"
                                                        + "(208, 'cam_piloto8', '333222111', 'user8', 'user8@example.com', 'Almería, España', 'EMPRESAPILOTO4', NULL, '$2a$10$UuMGQU9YECEKvuUMjiFXGuDHC.zzMfOhcAbcQj6Ql9ieOKUczQE9y9',202)");

                        // Insert Empresas
                        statement.addBatch("INSERT IGNORE INTO empresas (id, web, nif, usuario_id) VALUES "
                                        + "(201, 'https://www.example1.com', 'A12345678', 205),"
                                        + "(202, 'https://www.example2.com', 'B87654321', 206),"
                                        + "(203, 'https://www.example3.com', 'A87654321', 207),"
                                        + "(204, 'https://www.example4.com', 'B12345678', 208)");

                        // Insert Camioneros
                        statement.addBatch(
                                        "INSERT IGNORE INTO camioneros (id, experiencia, dni, disponibilidad, tieneCAP, expiracionCAP, usuario_id) VALUES "
                                                        + "(201, 5, '12345678Z', 'NACIONAL', true, '2025-12-31', 201),"
                                                        + "(202, 10, '23456789A', 'NACIONAL', false, '2025-12-31', 202),"
                                                        + "(203, 5, '87654321Z', 'NACIONAL', true, '2026-12-31', 203),"
                                                        + "(204, 22, '98765432A', 'NACIONAL', false, '2025-05-31', 204)");

                        // Insert Camiones
                        statement.addBatch(
                                        "INSERT IGNORE INTO camion (id, matricula, modelo, foto, notas, camionero_id) VALUES "
                                                        + "(201, '1234ABC', 'Ford Transit', NULL, 'Camión en excelente estado', 201),"
                                                        + "(202, '5678DEF', 'Mercedes Benz Sprinter', NULL, NULL, 202),"
                                                        + "(203, '8765GHI', 'Mercedes Benz Actros', NULL, NULL, 203),"
                                                        + "(204, '4321JKL', 'Volksvagen Crafter', NULL, 'Recientemente ha pasado la revision', '204')");

                        // Insert Autónomos
                        statement.addBatch("INSERT IGNORE INTO autonomo (id, camionero_id) VALUES "
                                        + "(201, 201),"
                                        + "(202, 203)");

                        // Insert Autonomo tarjetas
                        statement.addBatch("INSERT IGNORE INTO autonomo_tarjetas (autonomo_id, tarjetas) VALUES "
                                        + "(201, 'VTC'),"
                                        + "(201, 'VC'),"
                                        + "(202, 'VTC'),"
                                        + "(202, 'VC')");

                        // Insert Camionero Licencias
                        statement.addBatch("INSERT IGNORE INTO camionero_licencias (camionero_id, licencias) VALUES "
                                        + "(201, 'A'),"
                                        + "(201, 'C1_E'),"
                                        + "(202, 'C'),"
                                        + "(203, 'D'),"
                                        + "(204, 'D1_E')");

                        // Insert Reseñas
                        statement.addBatch("INSERT IGNORE INTO reseñas (id, comentarios, valoracion, user_id) VALUES "
                                        + "(201,'Execelente trabajo', 5,201),"
                                        + "(202,'Muy bueno, aunque la carga sufrió problemas', 4,201),"
                                        + "(203,'No volvería a contratar', 1,202),"
                                        + "(204,'Horrible, no cumplió los plazos establecidos en ninguna de nuestras ofertas que le asignamos', 1,202),"
                                        + "(205,'Mal', 2,203),"
                                        + "(206,'Bien', 4,204)");

                        // Insert Ofertas
                        statement.addBatch(
                                        "INSERT IGNORE INTO ofertas (id, titulo, experiencia, licencia, notas, estado, fecha_publicacion, sueldo, camionero_id, empresa_id) VALUES "
                                                        + "(201, 'Conductor de Carga Pesada', 5, 'D1_E', 'Se requiere experiencia en cargas pesadas', 'PENDIENTE', '2025-03-05 08:00', 2500.00, NULL, 201),"
                                                        + "(202, 'Transportista Nacional', 8, 'D1_E', 'Viajes a nivel nacional', 'PENDIENTE', '2025-03-03 10:45', 3200.00, NULL, 202),"
                                                        + "(203, 'Carga de Sevilla a Madrid', 2, 'B', 'Transportar 1200 kg de electrodomesticos de Sevilla a Madrid', 'ACEPTADA', '2025-03-02 20:30', 2500.00, 202, 201),"
                                                        + "(204, 'Carga de Sevilla a Murcia', 0, 'A1', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'PENDIENTE', '2025-03-02 09:30', 2500.00, NULL, 202),"
                                                        + "(205, 'Conductor Nocturna', 10, 'D1_E', 'Buscamos trabajador para mover cargas en horario nocturno', 'PENDIENTE', '2025-01-05 08:00', 2500.00, NULL, 201),"
                                                        + "(206, 'Transportista en Valencia', 8, 'D1_E', 'Viajes limitados a la comunidad valenciana', 'PENDIENTE', '2025-03-03 10:45', 3200.00, NULL, 202),"
                                                        + "(207, 'Carga de Barcelona a Sevilla', 20, 'B', 'Transportar 10 t de alimentos de Barcelona a Sevilla', 'ACEPTADA', '2025-07-02 09:30', 5000.00, 201, 201),"
                                                        + "(208, 'Carga de Barcelona a Madrid', 2, 'A1', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'RECHAZADA', '2025-01-02 09:30', 2500.00, NULL, 202),"
                                                        + "(209, 'Conductor de Multiples cargas', 5, 'D1_E', 'Se requiere experiencia, tanto para cargas pesadas como frágiles', 'ACEPTADA', '2025-02-10 08:00', 2500.00, 202, 201),"
                                                        + "(210, 'Transportista en Andalucía', 8, 'D1_E', 'Viajes limitados a la comunidad andaluza', 'PENDIENTE', '2025-03-03 10:45', 3200.00, NULL, 202),"
                                                        + "(211, 'Carga de Valencia a Vigo', 2, 'B', 'Transportar 3.5 t de pescado de Valencia a Vigo', 'ACEPTADA', '2025-03-02 09:30', 2500.00, 203, 201),"
                                                        + "(212, 'Carga de Sevilla a Alicante', 2, 'C', 'Transportar 300 kg de paquetes de Sevilla a Murcia', 'PENDIENTE', '2025-03-02 18:00', 2500.00, NULL, 202)");

                        // Insert Trabajos
                        statement.addBatch(
                                        "INSERT IGNORE INTO trabajos (id, fecha_incorporacion, jornada, oferta_id) VALUES "
                                                        + "(201,'2025-03-10', 'REGULAR', 201),"
                                                        + "(202,'2025-03-10', 'FLEXIBLE', 202),"
                                                        + "(203,'2025-02-15', 'COMPLETA', 205),"
                                                        + "(204,'2025-03-10', 'NOCTURNA', 206),"
                                                        + "(205,'2025-03-12', 'MIXTA', 209),"
                                                        + "(206,'2025-03-10', 'RELEVOS', 210)");

                        // Insert Cargas
                        statement.addBatch(
                                        "INSERT IGNORE INTO cargas (id, mercancia, peso, origen, destino, distancia, inicio, fin_minimo, fin_maximo, oferta_id) VALUES "
                                                        + "(201, 'Electrodomésticos', 1200.50, 'Sevilla', 'Madrid', 530, '2025-03-10 09:30', '2025-03-11 08:00', '2025-03-12 09:30', 203),"
                                                        + "(202, 'Ropa', 500.00, 'Sevilla', 'Murcia', 520, '2025-03-10 09:30', '2025-03-11 09:30', '2025-03-12 09:30', 204),"
                                                        + "(203, 'Alimentos', 10000.00 , 'Barcelona', 'Sevilla', 830, '2025-07-10 09:30', '2025-07-13 08:00', '2025-07-17 09:30', 207),"
                                                        + "(204, 'Muebles', 2000.00, 'Barcelona', 'Madrid', 620, '2025-03-10 09:30', '2025-03-11 09:30', '2025-03-12 09:30', 208),"
                                                        + "(205, 'Pescado', 3500.50, 'Valencia', 'Vigo', 955, '2025-03-10 09:30', '2025-03-13 08:00', '2025-05-17 09:30', 211),"
                                                        + "(206, 'Conjunto de paquete pequeños', 300.00, 'Sevilla', 'Alicante', 595, '2025-03-10 09:30', '2025-03-11 09:30', '2025-03-12 09:30', 212)");


                        statement.addBatch("INSERT IGNORE INTO aplicados (oferta_id, camionero_id) VALUES "
                                                        + "(201, 201),"
                                                        + "(201, 202),"
                                                        + "(201, 203),"
                                                        + "(201, 204),"
                                                        + "(206, 203),"
                                                        + "(210, 202),"
                                                        + "(210, 204)");
                        // Execute batch
                        statement.executeBatch();
                        System.out.println("Batch execution completed successfully.");

                }
        }
}