package com.camyo.backend.configuration;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import jakarta.annotation.PostConstruct;

@Configuration
@Profile("!test")
public class DataInitializer {

        @Autowired
        private DataSource dataSource;

        @PostConstruct
        public void init() throws SQLException {
                try (Connection connection = dataSource.getConnection();
                        Statement statement = connection.createStatement()) {
                                
                                // Insert Authorities
                                statement.addBatch("INSERT IGNORE INTO authorities (id, authority) VALUES "
                                        + "(201, 'CAMIONERO'),"
                                        + "(202, 'EMPRESA'),"
                                        + "(203, 'ADMIN')");
                        
                                // Insert Users
                                statement.addBatch("INSERT IGNORE INTO usuario (id, nombre, telefono, username, email, localizacion, descripcion, foto, password, authority) VALUES "
                                        + "(201, 'Ramón García', '123456789', 'cam_piloto1', 'ramgar@ejemplo.com', 'Sevilla, España', 'Camionero sevillano buscando trabajo', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(202, 'Jose Luis Trujillo', '987654321', 'cam_piloto2', 'jostru@ejemplo.com', 'Barcelona, España', 'Cuando me dan un trabajo no hay quien me detenga', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(203, 'Paco Fernández', '123454321', 'cam_piloto3', 'pacfer@ejemplo.com', 'Vigo, España', 'En busca de las mejores reseñas', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(204, 'Roberto Jiménez', '987656789', 'cam_piloto4', 'robjim@ejemplo.com', 'Madrid, España', 'Me gusta mi trabajo y pongo todo mi esfuerzo en él', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(205, 'Emilia Martel', '123456789', 'cam_piloto5', 'emimar@ejemplo.com', 'Sevilla, España', 'Descripción en proceso, revisen más tarde', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(206, 'Maria Martínez', '987654321', 'cam_piloto6', 'marmar@ejemplo.com', 'Barcelona, España', 'Mi camión es mejor que Optimus Prime', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(207, 'Mario Fuentes', '123454321', 'cam_piloto7', 'marfue@ejemplo.com', 'Vigo, España', 'Paciente pero eficiente', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(208, 'Jorge López', '987656789', 'cam_piloto8', 'jorlop@ejemplo.com', 'Madrid, España', 'Rápido y furioso, camionero a todo gas', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(209, 'Francisco Velez', '123456789', 'cam_piloto9', 'fravel@ejemplo.com', 'Sevilla, España', 'Adoro Camyo', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(210, 'Curro Ortiz', '987654321', 'cam_piloto10', 'curort@ejemplo.com', 'Barcelona, España', 'Autónomo en busca de trabajo', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(211, 'Francisca Cuevas', '123454321', 'cam_piloto11', 'fracue@ejemplo.com', 'Vigo, España', 'Mejor velocista que Flash', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(212, 'Pilar López', '987656789', 'cam_piloto12', 'pillop@ejemplo.com', 'Madrid, España', 'Busco trabajo', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(213, 'Ricardo Ortiz', '123456789', 'cam_piloto13', 'ricort@ejemplo.com', 'Sevilla, España', 'Recorro la distancia que sea necesaria para cumplir mis objetivos', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(214, 'Julia Guerrero', '987654321', 'cam_piloto14', 'julgue@ejemplo.com', 'Barcelona, España', 'Por favor no me rechacen, necesito trabajo', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(215, 'Julio Vela', '123454321', 'cam_piloto15', 'julvel@ejemplo.com', 'Vigo, España', 'Poseedor del motor más potente del mundo', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(216, 'Aurora Roa', '987656789', 'cam_piloto16', 'aurroa@ejemplo.com', 'Madrid, España', 'La camionera más veloz de toda Madrid', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(217, 'Rafael Corchuelo', '123456779', 'cam_piloto17', 'rafcor@ejemplo.com', 'Sevilla, España', 'No me manden mensajes sin sentido', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(218, 'Ismael Aparicio', '987654321', 'cam_piloto18', 'ismapa@ejemplo.com', 'Barcelona, España', 'Camionero catalán en busca de trabajo', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(219, 'Victor Gallardo', '123454321', 'cam_piloto19', 'vicgal@ejemplo.com', 'Vigo, España', 'Autónomo disponible y fiable', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(220, 'Roberto Cheney', '987656789', 'cam_piloto20', 'robche@ejemplo.com', 'Madrid, España', 'Experto en transporte de cargas', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(221, 'Manuel Manzano', '123456789', 'cam_piloto21', 'manman@ejemplo.com', 'Sevilla, España', 'Siempre eficaz y puntual', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        

                                        + "(222, 'Mercadia', '555666771', 'emp_piloto1', 'mercadia@ejemplo.com', 'Valencia, España', 'Supercamiones de confianza', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(223, 'Transdona', '111222333', 'emp_piloto2', 'transdona@ejemplo.com', 'Sevilla, España', 'La calidad de transporte al mejor precio ', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(224, 'Portadores', '777666555', 'emp_piloto3', 'portadores@ejemplo.com', 'Alicante, España', 'La empresa de confianza para sus paquetes', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(225, 'El Labrador', '333222111', 'emp_piloto4', 'ellabrador@ejemplo.com', 'Almería, España', 'El mejor amigo del camionero', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(226, 'Mercavalencia', '555666772', 'emp_piloto5', 'mercavalencia@ejemplo.com', 'Valencia, España', 'Valencianos de confianza, para manejar sus envios', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(227, 'Transca', '111222333', 'emp_piloto6', 'transca@ejemplo.com', 'Sevilla, España', 'Transportes para todos', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(228, 'TodoPaquetes', '777626555', 'emp_piloto7', 'todopaquetes@ejemplo.com', 'Alicante, España', 'Han llegado los paquetes a domicilio, lo hacemos de todo, cargas y trabajos a precios increibles', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(229, 'PortaJueves', '323222121', 'emp_piloto8', 'portajueves@ejemplo.com', 'Almería, España', 'Si lo pide un lunes le llega al cuarto día', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(230, 'Hispatrans', '111222333', 'emp_piloto9', 'hispatrans@ejemplo.com', 'Sevilla, España', 'La empresa de hispana más eficaz de la península', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(231, 'Alicante Transportes', '777665355', 'emp_piloto10', 'alicantetransportes@ejemplo.com', 'Alicante, España', 'Nos especializamos en transporte de maquinaria pesada', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(232, 'Almetrans', '333222111', 'emp_piloto11', 'almetrans@ejemplo.com', 'Almería, España', 'Transporte de mercancía perecedera en camiones frigoríficos', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(233, 'Valencia Envío Directo', '555666777', 'emp_piloto12', 'valenciaenviodirecto@ejemplo.com', 'Valencia, España', 'Manejamos envios desde Valencia y hacia Valencia', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(234, 'Hispaquetería', '111222333', 'emp_piloto13', 'hispaqueteria@ejemplo.com', 'Sevilla, España', 'Manejamos paquetes hispanos sevillanos y de cercanias', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(235, 'ValEnvios', '777662555', 'emp_piloto14', 'valenvios@ejemplo.com', 'Alicante, España', 'Transporte de paquetería fuera y dentro de la Comunidad Valenciana', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(236, 'Transportes del Sur', '333222111', 'emp_piloto15', 'transportessur@ejemplo.com', 'Almería, España', 'Una empresa mejor que la canción de navidad de Canal Sur', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(237, 'Valencarga', '777666555', 'emp_piloto16', 'valencarga@ejemplo.com', 'Alicante, España', 'No se que hay que poner aqui, pero tenenmos buenas ofertas', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(238, 'Trans-Andalus', '233212111', 'emp_piloto17', 'transandalus@ejemplo.com', 'Córdoba, España', 'Expandiendo el transporte desde Córdoba al resto de la península', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        
                                        + "(239, 'Isabel', '777666555', 'isabel', 'isabel@ejemplo.com', 'Badajoz, España', 'La mejor camionera autónoma', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',201),"
                                        + "(240, 'MOPA', '777666555', 'mopa', 'mopa@ejemplo.com', 'Badajoz, España', 'Empresa pacense buscando trabajadores por la península', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',202),"
                                        // contraseñas: 12
                                        + "(241, 'Manuel Jesús López', '333222111', 'manuel', 'manuel@gmail.com', 'Almería, España', 'Soy un experto en el sector desde hace muchos años, siempre estoy dispuesto a hacer un trabajo', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',201),"
                                        + "(242, 'José Luis Martinez', '777666555', 'joseluis', 'josel@gmail.com', 'Badajoz, España', 'Soy muy eficaz en tanto cargas como trabajos por contrato, soy el más veloz en todo', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',201),"
                                        //contraseñas: pass
                                        + "(243, 'Transportests', '555666777', 'emp_test', 'transportests@ejemplo.com', 'Valencia, España', 'Buscando a nuevos transportitas de prácticas', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(244, 'Teonardo Tesla', '123456789', 'cam_test', 'teotes@ejemplo.com', 'Sevilla, España', 'Buscando nuevos trabajos por todos lados', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(245, 'Transportes SA', '666555666', 'transportessa', 'transportes_sa@ejemplo.com', 'Cáceres, España', 'Empresa española de gran importancia', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(246, 'CamyoTrans', '656656556', 'camyotrans', 'camyotrans@ejemplo.com', 'Sevilla, España', 'Empresa española de categoría alta de transportes', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        // contraseñas: etsiipass
                                        + "(247, 'Camionero ETSII 1', '683910123', 'cam_etsii1', 'camioneroetsii1@ejemplo.com', 'Sevilla, España', 'Camionero representante de la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',201),"
                                        + "(248, 'Camionero ETSII 2', '658392910', 'cam_etsii2', 'camioneroetsii2@ejemplo.com', 'Sevilla, España', 'Camionero fiel a la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',201),"
                                        + "(249, 'Empresa ETSII 1', '643313512', 'emp_etsii1', 'empresaetsii1@ejemplo.com', 'Sevilla, España', 'Empresa representante de la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',202),"
                                        + "(250, 'Empresa ETSII 2', '693913941', 'emp_etsii2', 'empresaetsii2@ejemplo.com', 'Sevilla, España', 'Empresa fiel a la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',202),"
                                        + "(251, 'Administrador', '693913941', 'admin', 'admin@ejemplo.com', 'Sevilla, España', 'Administrador', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',203)");

                                // Insert Empresas
                                statement.addBatch("INSERT IGNORE INTO empresas (id, web, nif, usuario_id) VALUES "
                                        + "(201, 'https://sites.google.com/view/camyo-landing-page/', 'A12345678', 222),"
                                        + "(202, 'https://sites.google.com/view/camyo-landing-page/', 'B87654321', 223),"
                                        + "(203, 'https://sites.google.com/view/camyo-landing-page/', 'D87654321', 224),"
                                        + "(204, 'https://sites.google.com/view/camyo-landing-page/', 'E12345678', 225),"
                                        + "(205, 'https://sites.google.com/view/camyo-landing-page/', 'F12345678', 226),"
                                        + "(206, 'https://sites.google.com/view/camyo-landing-page/', 'G87654321', 227),"
                                        + "(207, 'https://sites.google.com/view/camyo-landing-page/', 'I87654321', 228),"
                                        + "(208, 'https://sites.google.com/view/camyo-landing-page/', 'H12345678', 229),"
                                        + "(209, 'https://sites.google.com/view/camyo-landing-page/', 'J12345678', 230),"
                                        + "(210, 'https://sites.google.com/view/camyo-landing-page/', 'K87654321', 231),"
                                        + "(211, 'https://sites.google.com/view/camyo-landing-page/', 'L87654321', 232),"
                                        + "(212, 'https://sites.google.com/view/camyo-landing-page/', 'M12345678', 233),"
                                        + "(213, 'https://sites.google.com/view/camyo-landing-page/', 'N12345678', 234),"
                                        + "(214, 'https://sites.google.com/view/camyo-landing-page/', 'O87654321', 235),"
                                        + "(215, 'https://sites.google.com/view/camyo-landing-page/', 'P87654321', 236),"
                                        + "(216, 'https://sites.google.com/view/camyo-landing-page/', 'Q12345678', 237),"
                                        + "(217, 'https://sites.google.com/view/camyo-landing-page/', 'R12345678', 238),"
                                        + "(218, 'https://sites.google.com/view/camyo-landing-page/', 'C12345678', 240),"
                                        + "(219, 'https://sites.google.com/view/camyo-landing-page/', 'D13545678', 243),"
                                        + "(220, 'https://sites.google.com/view/camyo-landing-page/', 'E13545678', 245),"
                                        + "(221, 'https://sites.google.com/view/camyo-landing-page/', 'F13545678', 246),"
                                        + "(222, 'https://sites.google.com/view/camyo-landing-page/', 'X13545678', 249),"
                                        + "(223, 'https://sites.google.com/view/camyo-landing-page/', 'Z13545678', 250)");

                                // Insert Camioneros
                                statement.addBatch("INSERT IGNORE INTO camioneros (id, experiencia, dni, disponibilidad, tieneCAP, expiracionCAP, usuario_id) VALUES "
                                        + "(201, 5, '12345678Z', 'NACIONAL', true, '2025-12-31', 201),"
                                        + "(202, 10, '23456789A', 'INTERNACIONAL', false, NULL, 202),"
                                        + "(203, 5, '87654321Z', 'NACIONAL', true, '2026-12-31', 203),"
                                        + "(204, 22, '98765432A', 'NACIONAL', false, NULL, 204),"
                                        + "(205, 7, '77777777A', 'NACIONAL', false, NULL, 205),"
                                        + "(206, 5, '12345678B', 'INTERNACIONAL', true, '2025-12-31', 206),"
                                        + "(207, 10, '23456789C', 'NACIONAL', false, NULL, 207),"
                                        + "(208, 5, '87654321D', 'NACIONAL', true, '2026-12-31', 208),"
                                        + "(209, 22, '98765432E', 'INTERNACIONAL', false, NULL, 209),"
                                        + "(210, 5, '12345678F', 'NACIONAL', true, '2025-12-31', 210),"
                                        + "(211, 10, '23456789G', 'INTERNACIONAL', false, NULL, 211),"
                                        + "(212, 5, '87654321H', 'NACIONAL', true, '2026-12-31', 212),"
                                        + "(213, 22, '98765432I', 'NACIONAL', false, NULL, 213),"
                                        + "(214, 5, '12345678J', 'NACIONAL', true, '2025-12-31', 214),"
                                        + "(215, 10, '23456789K', 'INTERNACIONAL', false, NULL, 215),"
                                        + "(216, 5, '87654321L', 'NACIONAL', true, '2026-12-31', 216),"
                                        + "(217, 22, '98765432M', 'NACIONAL', false, NULL, 217),"
                                        + "(218, 10, '23456789N', 'INTERNACIONAL', false, NULL, 218),"
                                        + "(219, 5, '87654321O', 'NACIONAL', true, '2026-12-31', 219),"
                                        + "(220, 22, '98765432P', 'NACIONAL', false, NULL, 220),"
                                        + "(221, 22, '98765432Q', 'NACIONAL', false, NULL, 221)," 
                                        + "(222, 7, '77777777R', 'INTERNACIONAL', false, NULL, 239),"
                                        + "(223, 22, '98765432S', 'NACIONAL', true, '2025-05-31', 241),"
                                        + "(224, 20, '98765432T', 'NACIONAL', true, '2025-05-31', 242),"
                                        + "(225, 20, '98765432X', 'INTERNACIONAL', true, '2025-05-31', 244),"
                                        + "(226, 10, '98765432G', 'NACIONAL', true, '2025-05-31', 247),"
                                        + "(227, 10, '98765422I', 'INTERNACIONAL', true, '2025-05-31', 248)");

                                // Insert Camiones
                                statement.addBatch("INSERT IGNORE INTO camion (id, matricula, modelo, foto, notas, camionero_id) VALUES "
                                        + "(201, '1234ABC', 'Ford Transit', NULL, 'Camión en excelente estado', 201),"
                                        + "(202, '5678DEF', 'Mercedes Benz Sprinter', NULL, NULL, 202),"
                                        + "(203, '8765GHI', 'Mercedes Benz Actros', NULL, NULL, 203),"
                                        + "(204, '4321JKL', 'Volksvagen Crafter', NULL, 'Recientemente ha pasado la revision', 204), "
                                        + "(205, '1235ABC', 'Ford Transit', NULL, 'Camión en excelente estado', 205),"
                                        + "(206, '5679DEF', 'Mercedes Benz Sprinter', NULL, NULL, 206),"
                                        + "(207, '8766GHI', 'Mercedes Benz Actros', NULL, NULL, 207),"
                                        + "(208, '4322JKL', 'Volksvagen Crafter', NULL, 'Recientemente ha pasado la revision', 208), "
                                        + "(209, '1236ABC', 'Ford Transit', NULL, 'Camión en excelente estado', 209),"
                                        + "(210, '5680DEF', 'Mercedes Benz Sprinter', NULL, NULL, 210),"
                                        + "(211, '8767GHI', 'Mercedes Benz Actros', NULL, NULL, 211),"
                                        + "(212, '4323JKL', 'Volksvagen Crafter', NULL, 'Recientemente ha pasado la revision', 212), "
                                        + "(213, '1237ABC', 'Ford Transit', NULL, 'Camión en excelente estado', 213),"
                                        + "(214, '5681DEF', 'Mercedes Benz Sprinter', NULL, NULL, 214),"
                                        + "(215, '8768GHI', 'Mercedes Benz Actros', NULL, NULL, 215),"
                                        + "(216, '4325JKL', 'Volksvagen Crafter', NULL, 'Recientemente ha pasado la revision', 216), "
                                        + "(217, '1238ABC', 'Ford Transit', NULL, 'Camión en excelente estado', 217),"
                                        + "(218, '5682DEF', 'Mercedes Benz Sprinter', NULL, NULL, 218),"
                                        + "(219, '8769GHI', 'Mercedes Benz Actros', NULL, NULL, 219),"
                                        + "(220, '1239ABC', 'Ford Transit', NULL, 'Camión en excelente estado', 220),"
                                        + "(221, '5683DEF', 'Mercedes Benz Sprinter', NULL, NULL, 221),"
                                        + "(222, '4326JKL', 'Volksvagen Crafter', NULL, 'Recientemente ha pasado la revision', 222),"
                                        + "(223, '1766SHI', 'Mercedes Benz Actros', NULL, NULL, 223),"
                                        + "(224, '4222SKL', 'Volksvagen Crafter', NULL, 'Recientemente ha pasado la revision', 224),"
                                        + "(225, '1136SBC', 'Ford Transit', NULL, 'Camión en excelente estado', 225),"
                                        + "(226, '5380SEF', 'Mercedes Benz Sprinter', NULL, NULL, 226),"
                                        + "(227, '8567SHI', 'Mercedes Benz Actros', NULL, NULL, 227)");

                                // Insert Camionero tarjetas
                                statement.addBatch("INSERT IGNORE INTO camionero_tarjetas_autonomo (camionero_id, tarjetas_autonomo) VALUES "
                                        + "(208, 0),"
                                        + "(209, 1),"
                                        + "(210, 2),"
                                        + "(213, 3),"
                                        + "(214, 0),"
                                        + "(219, 2),"
                                        + "(220, 2),"
                                        + "(221, 3),"
                                        + "(224, 0),"
                                        + "(227, 0)");

                                // La base de datos toma la posición del enum en vez del valor:
                                        // AM: 0
                                        // A1: 1
                                        // A2: 2
                                        // A: 3
                                        // B: 4
                                        // C1: 5
                                        // C: 6
                                        // C1_E: 7
                                        // C_E: 8
                                        // D1: 9
                                        // D_E: 10
                                        // D1_E: 11
                                        // D: 12
                                statement.addBatch("INSERT IGNORE INTO camionero_licencias (camionero_id, licencias) VALUES "
                                        + "(201, 6),"
                                        + "(202, 6),"
                                        + "(203, 6),"
                                        + "(204, 6),"
                                        + "(205, 6),"
                                        + "(206, 6),"
                                        + "(207, 6),"
                                        + "(208, 6),"
                                        + "(209, 6),"
                                        + "(210, 6),"
                                        + "(211, 6),"
                                        + "(212, 6),"
                                        + "(213, 6),"
                                        + "(214, 6),"
                                        + "(215, 6),"
                                        + "(216, 6),"
                                        + "(217, 6),"
                                        + "(218, 6),"
                                        + "(219, 6),"
                                        + "(220, 6),"
                                        + "(221, 6),"
                                        + "(222, 6),"
                                        + "(223, 6),"
                                        + "(224, 6),"
                                        + "(225, 6),"
                                        + "(226, 6),"
                                        + "(227, 6),"
                                        + "(201, 8),"
                                        + "(202, 8),"
                                        + "(203, 8),"
                                        + "(204, 8),"
                                        + "(205, 8),"
                                        + "(206, 8),"
                                        + "(207, 8),"
                                        + "(208, 8),"
                                        + "(209, 8),"
                                        + "(210, 8),"
                                        + "(211, 8),"
                                        + "(212, 8),"
                                        + "(213, 8),"
                                        + "(214, 8),"
                                        + "(215, 8),"
                                        + "(216, 8),"
                                        + "(217, 8),"
                                        + "(218, 8),"
                                        + "(219, 8),"
                                        + "(220, 8),"
                                        + "(221, 8),"
                                        + "(222, 8),"
                                        + "(223, 8),"
                                        + "(224, 8),"
                                        + "(225, 8),"
                                        + "(226, 8),"
                                        + "(227, 8)");

                                // Insert Reseñas
                                statement.addBatch("INSERT IGNORE INTO reseñas (id, comentarios, valoracion, comentador_id, comentado_id) VALUES "
                                        + "(201,'Excelente trabajo', 5, 222, 241),"
                                        + "(202,'Muy bueno, aunque la carga sufrió problemas', 4, 201, 250),"
                                        + "(203,'No volvería a contratar', 1, 202, 224),"
                                        + "(204,'Horrible, no cumplió los plazos establecidos en ninguna de nuestras ofertas que le asignamos', 1, 201, 225),"
                                        + "(205,'Mal', 2, 224, 202),"
                                        + "(206,'Bien', 4, 250, 201)");

                                // Insert Ofertas
                                statement.addBatch(
                                "INSERT IGNORE INTO ofertas (id, titulo, experiencia, licencia, notas, estado, fecha_publicacion, sueldo, camionero_id, empresa_id, localizacion, promoted) VALUES "
                                        + "(201, 'Conductor de Carga Pesada', 5, 'C', 'Se requiere experiencia en cargas pesadas', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 221, 'Sevilla', true),"
                                        + "(202, 'Transportista Nacional', 3, 'C', 'Viajes a nivel nacional', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 202, 'Barcelona', false),"
                                        + "(203, 'Carga de Sevilla a Madrid', 2, 'C', 'Transportar 1200 kg de electrodomesticos de Sevilla a Madrid', 'ABIERTA', '2025-05-02 20:30', 2500.00, NULL, 203, 'Sevilla', false),"
                                        + "(204, 'Carga de Sevilla a Murcia', 0, 'C', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'ABIERTA', '2025-05-02 09:30', 2500.00, NULL, 204, 'Sevilla', false),"
                                        + "(205, 'Conductor Nocturna', 4, 'C', 'Buscamos trabajador para mover cargas en horario nocturno', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 205, 'Valencia', false),"
                                        + "(206, 'Transportista en Valencia', 3, 'C', 'Viajes limitados a la comunidad valenciana', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 206, 'Valencia', false),"
                                        + "(207, 'Carga de Barcelona a Sevilla', 0, 'C', 'Transportar 10 t de alimentos de Barcelona a Sevilla', 'ABIERTA', '2025-07-02 09:30', 5000.00, NULL, 207, 'Barcelona', false),"
                                        + "(208, 'Carga de Barcelona a Madrid', 2, 'C', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'ABIERTA', '2025-05-02 09:30', 2500.00, NULL, 208, 'Barcelona', false),"
                                        + "(209, 'Conductor de Multiples cargas', 5, 'C', 'Se requiere experiencia, tanto para cargas pesadas como frágiles', 'ABIERTA', '2025-02-10 08:00', 2500.00, NULL, 209, 'Sevilla', false),"
                                        + "(210, 'Transportista en Andalucía', 0, 'C', 'Viajes limitados a la comunidad andaluza', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 210, 'Sevilla', false),"
                                        + "(211, 'Carga de Valencia a Vigo', 2, 'C', 'Transportar 3.5 t de pescado de Valencia a Vigo', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 211, 'Valencia', false),"
                                        + "(212, 'Carga de Sevilla a Alicante', 2, 'C', 'Transportar 300 kg de paquetes de Sevilla a Murcia', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 212, 'Sevilla', false),"
                                        + "(213, 'Transportista Nacional', 0, 'C', 'Viajes a nivel nacional', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 213, 'Barcelona', false),"
                                        + "(214, 'Carga de Sevilla a Madrid', 2, 'C', 'Transportar 1200 kg de electrodomesticos de Sevilla a Madrid', 'ABIERTA', '2025-05-02 20:30', 2500.00, NULL, 214, 'Sevilla', false),"
                                        + "(215, 'Carga de Sevilla a Murcia', 0, 'C', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'ABIERTA', '2025-05-02 09:30', 2500.00, NULL, 215, 'Sevilla', false),"
                                        + "(216, 'Conductor Nocturna', 0, 'C', 'Buscamos trabajador para mover cargas en horario nocturno', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 216, 'Valencia', false),"
                                        + "(217, 'Transportista en Valencia', 3, 'C', 'Viajes limitados a la comunidad valenciana', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 217, 'Valencia', false),"
                                        + "(218, 'Transportista en Huelva', 3, 'C', 'Viajes limitados a la comunidad andaluza', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 218, 'Huelva', false),"
                                        + "(219, 'Carga de Cáceres a Sevilla', 2, 'C', 'Transportar 300 kg de paquetes de Cáceres a Sevilla', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 219, 'Cáceres', false),"
                                        + "(220, 'Transportista en Cáceres', 3, 'C_E', 'Viajes limitados a la comunidad extremeña', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 220, 'Cáceres', false),"
                                        + "(221, 'Transportista en Cataluña', 3, 'C_E', 'Viajes limitados a la comunidad catalana', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 221, 'Barcelona', false),"
                                        + "(222, 'Transportista en Almería', 3, 'C', 'Viajes limitados a la comunidad andaluza', 'ABIERTA', '2025-05-03 10:45', 3250.00, NULL, 221, 'Andalucía', false),"
                                        + "(223, 'Carga de Sevilla a Córdoba', 3, 'C_E', 'Transportar 350 kg de paquetes de Sevilla a Córdoba', 'ABIERTA', '2025-05-03 10:45', 3100.00, NULL, 221, 'Andalucía', false),"
                                        + "(224, 'Transporte urgente de Sevilla a Córdoba', 3, 'C_E', 'Transportar 350 kg de documentos urgentes desde Sevilla hasta Córdoba', 'CERRADA', '2025-05-03 10:45', 3200.00, 223, 201, 'Andalucía', false),"
                                        + "(225, 'Envío de mercancías de Sevilla a Córdoba', 0, 'C_E', 'Transportar 350 kg de productos electrónicos desde Sevilla hasta Córdoba', 'CERRADA', '2025-05-03 10:45', 3300.00, 201, 223, 'Andalucía', false),"
                                        + "(226, 'Distribución de paquetes de Sevilla a Córdoba', 3, 'C_E', 'Transportar 350 kg de paquetes comerciales desde Sevilla hasta Córdoba', 'CERRADA', '2025-05-03 10:45', 3400.00, 202, 203, 'Andalucía', false),"
                                        + "(227, 'Logística express de Sevilla a Córdoba', 3, 'C_E', 'Transportar 350 kg de materiales médicos desde Sevilla hasta Córdoba', 'CERRADA', '2025-05-03 10:45', 3500.00, 201, 205, 'Andalucía', false),"
                                        + "(228, 'Conductor a toda velocidad', 5, 'C', 'Se requiere experiencia en trabajos rápidos', 'ABIERTA', '2025-05-05 08:00', 2200.00, NULL, 201, 'Sevilla', false),"
                                        + "(229, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 201, 220, 'BADAJOZ', false),"
                                        + "(230, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 202, 220, 'BADAJOZ', false),"
                                        + "(231, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 203, 220, 'BADAJOZ', false),"
                                        + "(232, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 204, 220, 'BADAJOZ', false),"
                                        + "(233, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 205, 220, 'BADAJOZ', false),"
                                        + "(234, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 206, 220, 'BADAJOZ', false),"
                                        + "(235, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 207, 220, 'BADAJOZ', false),"
                                        + "(236, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 208, 220, 'BADAJOZ', false),"
                                        + "(237, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 209, 220, 'BADAJOZ', false),"
                                        + "(238, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 210, 220, 'BADAJOZ', false),"
                                        + "(239, 'Transportista en Badajoz', 3, 'C', 'Viajes limitados por Badajoz', 'CERRADA', '2025-05-03 10:45', 2500.00, 225, 220, 'BADAJOZ', false)");

                                // Insert Trabajos
                                statement.addBatch("INSERT IGNORE INTO trabajos (id, fecha_incorporacion, jornada, oferta_id) VALUES "
                                        + "(201,'2025-05-10', 'REGULAR', 201),"
                                        + "(202,'2025-05-10', 'FLEXIBLE', 202),"
                                        + "(203,'2025-05-15', 'COMPLETA', 205),"
                                        + "(204,'2025-05-10', 'NOCTURNA', 206),"
                                        + "(205,'2025-05-12', 'MIXTA', 209),"
                                        + "(206,'2025-05-10', 'REGULAR', 213),"
                                        + "(207,'2025-05-10', 'RELEVOS', 210),"
                                        + "(208,'2025-05-10', 'FLEXIBLE', 216),"
                                        + "(209,'2025-05-15', 'COMPLETA', 217),"
                                        + "(210,'2025-05-15', 'FLEXIBLE', 218),"
                                        + "(211,'2025-05-15', 'MIXTA', 220),"
                                        + "(212,'2025-05-15', 'FLEXIBLE', 221),"
                                        + "(213,'2025-05-15', 'FLEXIBLE', 222),"
                                        + "(214,'2025-05-10', 'REGULAR', 228),"
                                        + "(215,'2025-05-15', 'MIXTA', 229),"
                                        + "(216,'2025-05-15', 'MIXTA', 230),"
                                        + "(217,'2025-05-15', 'MIXTA', 231),"
                                        + "(218,'2025-05-15', 'MIXTA', 232),"
                                        + "(219,'2025-05-15', 'MIXTA', 233),"
                                        + "(220,'2025-05-15', 'MIXTA', 234),"
                                        + "(221,'2025-05-15', 'MIXTA', 235),"
                                        + "(222,'2025-05-15', 'MIXTA', 236),"
                                        + "(223,'2025-05-15', 'MIXTA', 237),"
                                        + "(224,'2025-05-15', 'MIXTA', 238),"
                                        + "(225,'2025-05-15', 'MIXTA', 239)"
                                        );

                                // Insert Cargas
                                statement.addBatch("INSERT IGNORE INTO cargas (id, mercancia, peso, origen, destino, distancia, inicio, fin_minimo, fin_maximo, oferta_id) VALUES "
                                        + "(201, 'Electrodomésticos', 1200.50, 'Sevilla', 'Madrid', 530, '2025-05-10', '2025-05-11', '2025-05-12', 203),"
                                        + "(202, 'Ropa', 500.00, 'Sevilla', 'Murcia', 520, '2025-05-10', '2025-05-11', '2025-05-12', 204),"
                                        + "(203, 'Alimentos', 10000.00 , 'Barcelona', 'Sevilla', 830, '2025-07-10', '2025-07-13', '2025-07-17', 207),"
                                        + "(204, 'Muebles', 2000.00, 'Barcelona', 'Madrid', 620, '2025-05-10', '2025-05-11', '2025-05-12', 208),"
                                        + "(205, 'Pescado', 3500.50, 'Valencia', 'Vigo', 955, '2025-05-10', '2025-05-13', '2025-05-17', 211),"
                                        + "(206, 'Conjunto de paquete pequeños', 300.00, 'Sevilla', 'Alicante', 595, '2025-05-10', '2025-05-11', '2025-05-12', 212),"
                                        + "(207, 'Electrodomésticos', 1200.50, 'Sevilla', 'Madrid', 530, '2025-05-10', '2025-05-11', '2025-05-12', 214),"
                                        + "(208, 'Ropa', 500.00, 'Sevilla', 'Murcia', 520, '2025-05-10', '2025-05-11', '2025-05-12', 215),"
                                        + "(209, 'Conjunto de paquete pequeños', 300.00, 'Cáceres', 'Sevilla', 595, '2025-05-10', '2025-05-11', '2025-05-12', 219),"
                                        + "(210, 'Conjunto de paquete pequeños', 350.00, 'Sevilla', 'Córdoba', 580, '2025-05-10', '2025-05-11', '2025-05-12', 223),"
                                        + "(211, 'Conjunto de documentos urgentes', 350.00, 'Sevilla', 'Córdoba', 595, '2025-05-10', '2025-05-11', '2025-05-12', 224),"
                                        + "(212, 'Conjunto de productos electrónicos', 350.00, 'Sevilla', 'Córdoba', 600, '2025-05-10', '2025-05-11', '2025-05-12', 225),"
                                        + "(213, 'Conjunto de paquetes comerciales', 350.00, 'Sevilla', 'Córdoba', 605, '2025-05-10', '2025-05-11', '2025-05-12', 226),"
                                        + "(214, 'Conjunto de materiales médicos', 350.00, 'Sevilla', 'Córdoba', 610, '2025-05-10', '2025-05-11', '2025-05-12', 227)");

                                // Insert aplicados
                                statement.addBatch("INSERT IGNORE INTO aplicados (oferta_id, camionero_id) VALUES "
                                        + "(201, 223),"
                                        + "(201, 224),"
                                        + "(202, 223),"
                                        + "(202, 224),"
                                        + "(203, 223),"
                                        + "(203, 224),"
                                        + "(204, 223),"
                                        + "(204, 224),"
                                        + "(205, 223),"
                                        + "(205, 224),"
                                        + "(206, 223),"
                                        + "(206, 224),"
                                        + "(207, 223),"
                                        + "(207, 224),"
                                        + "(208, 223),"
                                        + "(208, 224),"
                                        + "(209, 223),"
                                        + "(209, 224),"
                                        + "(210, 223),"
                                        + "(210, 224),"
                                        + "(211, 223),"
                                        + "(211, 224),"
                                        + "(212, 223),"
                                        + "(212, 224),"
                                        + "(213, 223),"
                                        + "(213, 224),"
                                        + "(214, 223),"
                                        + "(214, 224),"
                                        + "(215, 223),"
                                        + "(215, 224),"
                                        + "(216, 223),"
                                        + "(216, 224),"
                                        + "(217, 223),"
                                        + "(217, 224),"
                                        + "(218, 223),"
                                        + "(218, 224),"
                                        + "(219, 223),"
                                        + "(219, 224),"
                                        + "(220, 201),"
                                        + "(220, 202),"
                                        + "(220, 203),"
                                        + "(220, 204),"
                                        + "(220, 205),"
                                        + "(220, 206),"
                                        + "(220, 207),"
                                        + "(220, 208),"
                                        + "(220, 209),"
                                        + "(220, 210),"
                                        + "(220, 211),"
                                        + "(220, 212),"
                                        + "(220, 213),"
                                        + "(220, 214),"
                                        + "(220, 215),"
                                        + "(220, 216),"
                                        + "(220, 217),"
                                        + "(220, 218),"
                                        + "(220, 219),"
                                        + "(220, 220),"
                                        + "(220, 221),"
                                        + "(220, 223),"
                                        + "(220, 224),"
                                        + "(220, 225),"
                                        + "(221, 223),"
                                        + "(221, 224),"
                                        + "(222, 223),"
                                        + "(222, 224),"
                                        + "(223, 223),"
                                        + "(223, 224),"
                                        + "(228, 223),"
                                        + "(228, 224)");

                                // Insert rechazados
                                statement.addBatch("INSERT IGNORE INTO rechazados (oferta_id, camionero_id) VALUES "
                                        + "(218, 201),"
                                        + "(218, 202),"
                                        + "(218, 203),"
                                        + "(218, 204),"
                                        + "(218, 205),"
                                        + "(218, 206),"
                                        + "(218, 207),"
                                        + "(218, 208),"
                                        + "(218, 209),"
                                        + "(218, 210),"
                                        + "(218, 211),"
                                        + "(218, 212),"
                                        + "(218, 213),"
                                        + "(218, 214),"
                                        + "(218, 215),"
                                        + "(218, 216),"
                                        + "(218, 217),"
                                        + "(218, 218),"
                                        + "(218, 219),"
                                        + "(218, 220),"
                                        + "(218, 221),"
                                        + "(218, 225)");

                                // Insertar suscripciones
                                statement.addBatch("INSERT IGNORE INTO suscripciones (id, empresa_id, nivel, fecha_inicio, fecha_fin, activa) VALUES "
                                + "(1, 221, 'PREMIUM', '2025-03-16', '2025-04-16', true),"
                                + "(2, 222, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(3, 223, 'GRATIS', '2025-03-16', NULL, true),"
                                + "(4, 201, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(5, 202, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(6, 203, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(7, 204, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(8, 205, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(9, 206, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(10, 207, 'GRATIS', '2025-03-16', NULL, true),"
                                + "(11, 208, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(12, 209, 'PREMIUM', '2025-03-16', '2025-04-16', true),"
                                + "(13, 210, 'GRATIS', '2025-03-16', NULL, true),"
                                + "(14, 211, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(15, 212, 'PREMIUM', '2025-03-16', '2025-04-16', true),"
                                + "(16, 213, 'GRATIS', '2025-03-16', NULL, true),"
                                + "(17, 214, 'BASICO', '2025-03-16', '2025-04-16', true),"
                                + "(18, 215, 'PREMIUM', '2025-03-16', '2025-04-16', true),"
                                + "(19, 216, 'GRATIS', '2025-03-16', NULL, true),"
                                + "(20, 217, 'BASICO', '2025-03-16', '2025-04-16', true)"
                                );

                                // Insert Oferta Patrocinada
                                statement.addBatch("INSERT IGNORE INTO ofertas_patrocinadas (id, oferta_id, empresa_id, status) VALUES "
                                + "(1, 201, 221, 'ACTIVO')");

                                // Execute batch
                                statement.executeBatch();
                                System.out.println("Batch execution completed successfully.");

                        }
        }
}