package com.camyo.backend.configuration;

import java.sql.Connection;
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
                try (Connection connection = dataSource.getConnection();
                        Statement statement = connection.createStatement()) {
                                
                                // Insert Authorities
                                statement.addBatch("INSERT IGNORE INTO authorities (id, authority) VALUES "
                                        + "(201, 'CAMIONERO'),"
                                        + "(202, 'EMPRESA'),"
                                        + "(203, 'ADMIN')");
                        
                                // Insert Users
                                statement.addBatch("INSERT IGNORE INTO usuario (id, nombre, telefono, username, email, localizacion, descripcion, foto, password, authority) VALUES "
                                        + "(201, 'Camionero 1', '123456789', 'cam_piloto1', 'camionero1@ejemplo.com', 'Sevilla, España', 'Camionero por contrato', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(202, 'Camionero 2', '987654321', 'cam_piloto2', 'camionero2@ejemplo.com', 'Barcelona, España', 'Camionero por contrato', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(203, 'Camionero 3', '123454321', 'cam_piloto3', 'camionero3@ejemplo.com', 'Vigo, España', 'Camionero por contrato', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(204, 'Camionero 4', '987656789', 'cam_piloto4', 'camionero4@ejemplo.com', 'Madrid, España', 'Camionero por contrato', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(205, 'Camionero 5', '123456789', 'cam_piloto5', 'camionero5@ejemplo.com', 'Sevilla, España', 'Camionero por contrato', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(206, 'Camionero 6', '987654321', 'cam_piloto6', 'camionero6@ejemplo.com', 'Barcelona, España', 'Camionero por contrato', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(207, 'Camionero 7', '123454321', 'cam_piloto7', 'camionero7@ejemplo.com', 'Vigo, España', 'Camionero por contrato', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(208, 'Camionero 8', '987656789', 'cam_piloto8', 'camionero8@ejemplo.com', 'Madrid, España', 'Camionero autónomo', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(209, 'Camionero 9', '123456789', 'cam_piloto9', 'camionero9@ejemplo.com', 'Sevilla, España', 'Camionero autónomo', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(210, 'Camionero 10', '987654321', 'cam_piloto10', 'camionero10@ejemplo.com', 'Barcelona, España', 'Camionero autónomo', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(211, 'Camionero 11', '123454321', 'cam_piloto11', 'camionero11@ejemplo.com', 'Vigo, España', 'Camionero por contrato', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(212, 'Camionero 12', '987656789', 'cam_piloto12', 'camionero12@ejemplo.com', 'Madrid, España', 'Camionero por contrato', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(213, 'Camionero 13', '123456789', 'cam_piloto13', 'camionero13@ejemplo.com', 'Sevilla, España', 'Camionero autónomo', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(214, 'Camionero 14', '987654321', 'cam_piloto14', 'camionero14@ejemplo.com', 'Barcelona, España', 'Camionero autónomo', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(215, 'Camionero 15', '123454321', 'cam_piloto15', 'camionero15@ejemplo.com', 'Vigo, España', 'Camionero por contrato', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(216, 'Camionero 16', '987656789', 'cam_piloto16', 'camionero16@ejemplo.com', 'Madrid, España', 'Camionero por contrato', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(217, 'Camionero 17', '123456789', 'cam_piloto17', 'camionero17@ejemplo.com', 'Sevilla, España', 'Camionero por contrato', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(218, 'Camionero 18', '987654321', 'cam_piloto18', 'camionero18@ejemplo.com', 'Barcelona, España', 'Camionero por contrato', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',201),"
                                        + "(219, 'Camionero 19', '123454321', 'cam_piloto19', 'camionero19@ejemplo.com', 'Vigo, España', 'Camionero autónomo', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',201),"
                                        + "(220, 'Camionero 20', '987656789', 'cam_piloto20', 'camionero20@ejemplo.com', 'Madrid, España', 'Camionero autónomo', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',201),"
                                        + "(221, 'Camionero 21', '123456789', 'cam_piloto21', 'camionero21@ejemplo.com', 'Sevilla, España', 'Camionero autónomo', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        

                                        + "(222, 'Empresa 1', '555666777', 'emp_piloto1', 'empresa1@ejemplo.com', 'Valencia, España', 'Empresa piloto numero 1', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(223, 'Empresa 2', '111222333', 'emp_piloto2', 'empresa2@ejemplo.com', 'Sevilla, España', 'Empresa piloto numero 2', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(224, 'Empresa 3', '777666555', 'emp_piloto3', 'empresa3@ejemplo.com', 'Alicante, España', 'Empresa piloto numero 3', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(225, 'Empresa 4', '333222111', 'emp_piloto4', 'empresa4@ejemplo.com', 'Almería, España', 'Empresa piloto numero 4', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(226, 'Empresa 5', '555666777', 'emp_piloto5', 'empresa5@ejemplo.com', 'Valencia, España', 'Empresa piloto numero 5', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(227, 'Empresa 6', '111222333', 'emp_piloto6', 'empresa6@ejemplo.com', 'Sevilla, España', 'Empresa piloto numero 6', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(228, 'Empresa 7', '777666555', 'emp_piloto7', 'empresa7@ejemplo.com', 'Alicante, España', 'Empresa piloto numero 7', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(229, 'Empresa 8', '333222111', 'emp_piloto8', 'empresa8@ejemplo.com', 'Almería, España', 'Empresa piloto numero 8', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(230, 'Empresa 9', '111222333', 'emp_piloto9', 'empresa9@ejemplo.com', 'Sevilla, España', 'Empresa piloto numero 9', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(231, 'Empresa 10', '777666555', 'emp_piloto10', 'empresa10@ejemplo.com', 'Alicante, España', 'Empresa piloto numero 10', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(232, 'Empresa 11', '333222111', 'emp_piloto11', 'empresa11@ejemplo.com', 'Almería, España', 'Empresa piloto numero 11', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(233, 'Empresa 12', '555666777', 'emp_piloto12', 'empresa12@ejemplo.com', 'Valencia, España', 'Empresa piloto numero 12', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(234, 'Empresa 13', '111222333', 'emp_piloto13', 'empresa13@ejemplo.com', 'Sevilla, España', 'Empresa piloto numero 13', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(235, 'Empresa 14', '777666555', 'emp_piloto14', 'empresa14@ejemplo.com', 'Alicante, España', 'Empresa piloto numero 14', NULL, '$2a$10$MdDb.2lyMB4hG7u.5AFU2.eDVHXpZcnfzuTDNf/OzkOkFGRScQlSu',202),"
                                        + "(236, 'Empresa 15', '333222111', 'emp_piloto15', 'empresa15@ejemplo.com', 'Almería, España', 'Empresa piloto numero 15', NULL, '$2a$10$5vxm1b6TSa.x4TMs1Fhu3e1FAyIMRL4cm5WM35ZAMKN67aR3fTplW',202),"
                                        + "(237, 'Empresa 16', '777666555', 'emp_piloto16', 'empresa16@ejemplo.com', 'Alicante, España', 'Empresa piloto numero 16', NULL, '$2a$10$9ieupLSjo2Bs.LQUuCHs6uEb2Dv991yiFY00TjqSqhC8Gui3PzQ4q',202),"
                                        + "(238, 'Empresa 17', '333222111', 'emp_piloto17', 'empresa17@ejemplo.com', 'Almería, España', 'Empresa piloto numero 17', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        
                                        + "(239, 'Isabel', '777666555', 'isabel', 'isabel@ejemplo.com', 'Badajoz, España', 'camionera autonoma', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',201),"
                                        + "(240, 'mopa', '777666555', 'mopa', 'mopa@ejemplo.com', 'Badajoz, España', 'Empresa extremeña', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',202),"
                                        // contraseñas: 12
                                        + "(241, 'Manuel', '333222111', 'manuel', 'manuel@gmail.com', 'Almería, España', 'Camionero buscando trabajo', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',201),"
                                        + "(242, 'José Luis', '777666555', 'joseluis', 'josel@gmail.com', 'Badajoz, España', 'Camionero autonomo', NULL, '$2a$10$Kgkh3hHPPmPeu4TxhzC1DeYbZq.spo9FqHNDcPHiKxXgprBSZznF2',201),"
                                        //contraseñas: pass
                                        + "(243, 'Empresa Test', '555666777', 'emp_test', 'emp_test@ejemplo.com', 'Valencia, España', 'TESTPILOTO', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(244, 'Camionero Test', '123456789', 'cam_test', 'cam_test@ejemplo.com', 'Sevilla, España', 'TESTPILOTO', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',201),"
                                        + "(245, 'Transportes SA', '666555666', 'transportessa', 'transportes_sa@ejemplo.com', 'Cáceres, España', 'Empresa española de gran importancia', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        + "(246, 'CamyoTrans', '656656556', 'camyotrans', 'camyotrans@ejemplo.com', 'Sevilla, España', 'Transportistas sevillanos por todo el mundo', NULL, '$2a$10$rR8QzJaetgIk0m1ry6tWae.t6zb8uJ6WsSZyNO16FN.K6ILD4SIBq',202),"
                                        // contraseñas: etsiipass
                                        + "(247, 'Camionero ETSII 1', '683910123', 'cam_etsii1', 'camioneroetsii1@ejemplo.com', 'Sevilla, España', 'Camionero representante de la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',201),"
                                        + "(248, 'Camionero ETSII 2', '658392910', 'cam_etsii2', 'camioneroetsii2@ejemplo.com', 'Sevilla, España', 'Camionero fiel a la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',201),"
                                        + "(249, 'Empresa ETSII 1', '643313512', 'emp_etsii1', 'empresaetsii1@ejemplo.com', 'Sevilla, España', 'Empresa representante de la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',202),"
                                        + "(250, 'Empresa ETSII 2', '693913941', 'emp_etsii2', 'empresaetsii2@ejemplo.com', 'Sevilla, España', 'Empresa fiel a la ETSII', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',202),"
                                        + "(251, 'Administrador', '693913941', 'admin', 'admin@ejemplo.com', 'Sevilla, España', 'Administrador', NULL, '$2a$10$QDWb6N5rgvSSWlzkj06yP.KwbS7Kilb4uE0FP8RMLZ.9iCI2e0BHi',203)");

                                // Insert Empresas
                                statement.addBatch("INSERT IGNORE INTO empresas (id, web, nif, usuario_id) VALUES "
                                        + "(201, 'https://www.ejemplo1.com', 'A12345678', 222),"
                                        + "(202, 'https://www.ejemplo2.com', 'B87654321', 223),"
                                        + "(203, 'https://www.ejemplo3.com', 'D87654321', 224),"
                                        + "(204, 'https://www.ejemplo4.com', 'E12345678', 225),"
                                        + "(205, 'https://www.ejemplo5.com', 'F12345678', 226),"
                                        + "(206, 'https://www.ejemplo6.com', 'G87654321', 227),"
                                        + "(207, 'https://www.ejemplo7.com', 'I87654321', 228),"
                                        + "(208, 'https://www.ejemplo8.com', 'H12345678', 229),"
                                        + "(209, 'https://www.ejemplo9.com', 'J12345678', 230),"
                                        + "(210, 'https://www.ejemplo10.com', 'K87654321', 231),"
                                        + "(211, 'https://www.ejemplo11.com', 'L87654321', 232),"
                                        + "(212, 'https://www.ejemplo12.com', 'M12345678', 233),"
                                        + "(213, 'https://www.ejemplo13.com', 'N12345678', 234),"
                                        + "(214, 'https://www.ejemplo14.com', 'O87654321', 235),"
                                        + "(215, 'https://www.ejemplo15.com', 'P87654321', 236),"
                                        + "(216, 'https://www.ejemplo16.com', 'Q12345678', 237),"
                                        + "(217, 'https://www.ejemplo17.com', 'R12345678', 238),"
                                        + "(218, 'https://www.ejemplo18.com', 'C12345678', 240),"
                                        + "(219, 'https://www.ejemplo19.com', 'D13545678', 243),"
                                        + "(220, 'https://www.transportessa.com', 'E13545678', 245),"
                                        + "(221, 'https://www.camyotrans.com', 'F13545678', 246),"
                                        + "(222, 'https://www.etsii1.com', 'X13545678', 249),"
                                        + "(223, 'https://www.etsii2.com', 'Z13545678', 250)");

                                // Insert Camioneros
                                statement.addBatch("INSERT IGNORE INTO camioneros (id, experiencia, dni, disponibilidad, tieneCAP, expiracionCAP, usuario_id) VALUES "
                                        + "(201, 5, '12345678Z', 'NACIONAL', true, '2025-12-31', 201),"
                                        + "(202, 10, '23456789A', 'NACIONAL', false, '2025-12-31', 202),"
                                        + "(203, 5, '87654321Z', 'NACIONAL', true, '2026-12-31', 203),"
                                        + "(204, 22, '98765432A', 'NACIONAL', false, '2025-05-31', 204),"
                                        + "(205, 7, '77777777A', 'NACIONAL', false, '2025-05-31', 205),"
                                        + "(206, 5, '12345678B', 'NACIONAL', true, '2025-12-31', 206),"
                                        + "(207, 10, '23456789C', 'NACIONAL', false, '2025-12-31', 207),"
                                        + "(208, 5, '87654321D', 'NACIONAL', true, '2026-12-31', 208),"
                                        + "(209, 22, '98765432E', 'NACIONAL', false, '2025-05-31', 209),"
                                        + "(210, 5, '12345678F', 'NACIONAL', true, '2025-12-31', 210),"
                                        + "(211, 10, '23456789G', 'NACIONAL', false, '2025-12-31', 211),"
                                        + "(212, 5, '87654321H', 'NACIONAL', true, '2026-12-31', 212),"
                                        + "(213, 22, '98765432I', 'NACIONAL', false, '2025-05-31', 213),"
                                        + "(214, 5, '12345678J', 'NACIONAL', true, '2025-12-31', 214),"
                                        + "(215, 10, '23456789K', 'NACIONAL', false, '2025-12-31', 215),"
                                        + "(216, 5, '87654321L', 'NACIONAL', true, '2026-12-31', 216),"
                                        + "(217, 22, '98765432M', 'NACIONAL', false, '2025-05-31', 217),"
                                        + "(218, 10, '23456789N', 'NACIONAL', false, '2025-12-31', 218),"
                                        + "(219, 5, '87654321O', 'NACIONAL', true, '2026-12-31', 219),"
                                        + "(220, 22, '98765432P', 'NACIONAL', false, '2025-05-31', 220),"
                                        + "(221, 22, '98765432Q', 'NACIONAL', false, '2025-05-31', 221)," 
                                        + "(222, 7, '77777777R', 'NACIONAL', false, '2025-05-31', 239),"
                                        + "(223, 22, '98765432S', 'NACIONAL', true, '2025-05-31', 241),"
                                        + "(224, 20, '98765432T', 'NACIONAL', true, '2025-05-31', 242),"
                                        + "(225, 20, '98765432X', 'NACIONAL', true, '2025-05-31', 244),"
                                        + "(226, 10, '98765432G', 'NACIONAL', true, '2025-05-31', 247),"
                                        + "(227, 10, '98765422I', 'NACIONAL', true, '2025-05-31', 248)");

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
                                statement.addBatch("INSERT IGNORE INTO reseñas (id, comentarios, valoracion, user_id) VALUES "
                                        + "(201,'Excelente trabajo', 5,222),"
                                        + "(202,'Muy bueno, aunque la carga sufrió problemas', 4,223),"
                                        + "(203,'No volvería a contratar', 1,224),"
                                        + "(204,'Horrible, no cumplió los plazos establecidos en ninguna de nuestras ofertas que le asignamos', 1,225),"
                                        + "(205,'Mal', 2,225),"
                                        + "(206,'Bien', 4,226)");

                                // Insert Ofertas
                                statement.addBatch(
                                "INSERT IGNORE INTO ofertas (id, titulo, experiencia, licencia, notas, estado, fecha_publicacion, sueldo, camionero_id, empresa_id, localizacion) VALUES "
                                        + "(201, 'Conductor de Carga Pesada', 5, 'C', 'Se requiere experiencia en cargas pesadas', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 201, 'Sevilla'),"
                                        + "(202, 'Transportista Nacional', 3, 'C', 'Viajes a nivel nacional', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 202, 'Barcelona'),"
                                        + "(203, 'Carga de Sevilla a Madrid', 2, 'C', 'Transportar 1200 kg de electrodomesticos de Sevilla a Madrid', 'ABIERTA', '2025-05-02 20:30', 2500.00, NULL, 203, 'Sevilla'),"
                                        + "(204, 'Carga de Sevilla a Murcia', 0, 'C', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'ABIERTA', '2025-05-02 09:30', 2500.00, NULL, 204, 'Sevilla'),"
                                        + "(205, 'Conductor Nocturna', 4, 'C', 'Buscamos trabajador para mover cargas en horario nocturno', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 205, 'Valencia'),"
                                        + "(206, 'Transportista en Valencia', 3, 'C', 'Viajes limitados a la comunidad valenciana', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 206, 'Valencia'),"
                                        + "(207, 'Carga de Barcelona a Sevilla', 2, 'C', 'Transportar 10 t de alimentos de Barcelona a Sevilla', 'ABIERTA', '2025-07-02 09:30', 5000.00, NULL, 207, 'Barcelona'),"
                                        + "(208, 'Carga de Barcelona a Madrid', 2, 'C', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'ABIERTA', '2025-05-02 09:30', 2500.00, NULL, 208, 'Barcelona'),"
                                        + "(209, 'Conductor de Multiples cargas', 5, 'C', 'Se requiere experiencia, tanto para cargas pesadas como frágiles', 'ABIERTA', '2025-02-10 08:00', 2500.00, NULL, 209, 'Sevilla'),"
                                        + "(210, 'Transportista en Andalucía', 3, 'C', 'Viajes limitados a la comunidad andaluza', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 210, 'Sevilla'),"
                                        + "(211, 'Carga de Valencia a Vigo', 2, 'C', 'Transportar 3.5 t de pescado de Valencia a Vigo', 'ABIERTA', '2025-05-02 09:30', 2500.00, NULL, 211, 'Valencia'),"
                                        + "(212, 'Carga de Sevilla a Alicante', 2, 'C', 'Transportar 300 kg de paquetes de Sevilla a Murcia', 'ABIERTA', '2025-05-02 18:00', 2500.00, NULL, 212, 'Sevilla'),"
                                        + "(213, 'Transportista Nacional', 1, 'C', 'Viajes a nivel nacional', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 213, 'Barcelona'),"
                                        + "(214, 'Carga de Sevilla a Madrid', 2, 'C', 'Transportar 1200 kg de electrodomesticos de Sevilla a Madrid', 'ABIERTA', '2025-05-02 20:30', 2500.00, NULL, 214, 'Sevilla'),"
                                        + "(215, 'Carga de Sevilla a Murcia', 0, 'C', 'Transportar 500 kg de ropa de Sevilla a Murcia', 'ABIERTA', '2025-05-02 09:30', 2500.00, NULL, 215, 'Sevilla'),"
                                        + "(216, 'Conductor Nocturna', 4, 'C', 'Buscamos trabajador para mover cargas en horario nocturno', 'ABIERTA', '2025-05-05 08:00', 2500.00, NULL, 216, 'Valencia'),"
                                        + "(217, 'Transportista en Valencia', 3, 'C', 'Viajes limitados a la comunidad valenciana', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 217, 'Valencia'),"
                                        + "(218, 'Transportista en Huelva', 3, 'C', 'Viajes limitados a la comunidad andaluza', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 218, 'Huelva'),"
                                        + "(219, 'Carga de Cáceres a Sevilla', 2, 'C', 'Transportar 300 kg de paquetes de Cáceres a Sevilla', 'ABIERTA', '2025-05-02 18:00', 2500.00, NULL, 219, 'Cáceres'),"
                                        + "(220, 'Transportista en Cáceres', 3, 'C_E', 'Viajes limitados a la comunidad extremeña', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 220, 'Cáceres'),"
                                        + "(221, 'Transportista en Cataluña', 3, 'C_E', 'Viajes limitados a la comunidad catalana', 'ABIERTA', '2025-05-03 10:45', 3200.00, NULL, 221, 'Barcelona'),"
                                        + "(222, 'Transportista en Almería', 3, 'C', 'Viajes limitados a la comunidad andaluza', 'ABIERTA', '2025-05-03 10:45', 3250.00, NULL, 221, 'Andalucía'),"
                                        + "(223, 'Carga de Sevilla a Córdoba', 3, 'C_E', 'Transportar 350 kg de paquetes de Sevilla a Córdoba', 'ABIERTA', '2025-05-03 10:45', 3100.00, NULL, 221, 'Andalucía')");

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
                                        + "(213,'2025-05-15', 'FLEXIBLE', 222)");

                                // Insert Cargas
                                statement.addBatch("INSERT IGNORE INTO cargas (id, mercancia, peso, origen, destino, distancia, inicio, fin_minimo, fin_maximo, oferta_id) VALUES "
                                        + "(201, 'Electrodomésticos', 1200.50, 'Sevilla', 'Madrid', 530, '2025-05-10 09:30', '2025-05-11 08:00', '2025-05-12 09:30', 203),"
                                        + "(202, 'Ropa', 500.00, 'Sevilla', 'Murcia', 520, '2025-05-10 09:30', '2025-05-11 09:30', '2025-05-12 09:30', 204),"
                                        + "(203, 'Alimentos', 10000.00 , 'Barcelona', 'Sevilla', 830, '2025-07-10 09:30', '2025-07-13 08:00', '2025-07-17 09:30', 207),"
                                        + "(204, 'Muebles', 2000.00, 'Barcelona', 'Madrid', 620, '2025-05-10 09:30', '2025-05-11 09:30', '2025-05-12 09:30', 208),"
                                        + "(205, 'Pescado', 3500.50, 'Valencia', 'Vigo', 955, '2025-05-10 09:30', '2025-05-13 08:00', '2025-05-17 09:30', 211),"
                                        + "(206, 'Conjunto de paquete pequeños', 300.00, 'Sevilla', 'Alicante', 595, '2025-05-10 09:30', '2025-05-11 09:30', '2025-05-12 09:30', 212),"
                                        + "(207, 'Electrodomésticos', 1200.50, 'Sevilla', 'Madrid', 530, '2025-05-10 09:30', '2025-05-11 08:00', '2025-05-12 09:30', 214),"
                                        + "(208, 'Ropa', 500.00, 'Sevilla', 'Murcia', 520, '2025-05-10 09:30', '2025-05-11 09:30', '2025-05-12 09:30', 215),"
                                        + "(209, 'Conjunto de paquete pequeños', 300.00, 'Cáceres', 'Sevilla', 595, '2025-05-10 09:30', '2025-05-11 09:30', '2025-05-12 09:30', 219),"
                                        + "(210, 'Conjunto de paquete pequeños', 350.00, 'Sevilla', 'Córdoba', 580, '2025-05-10 09:30', '2025-05-11 09:30', '2025-05-12 09:30', 223)");

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
                                        + "(220, 223),"
                                        + "(220, 224),"
                                        + "(221, 223),"
                                        + "(221, 224),"
                                        + "(222, 223),"
                                        + "(222, 224),"
                                        + "(223, 223),"
                                        + "(223, 224)");
                                // Insertar suscripciones
                                statement.addBatch("INSERT IGNORE INTO suscripciones (id, empresa_id, nivel, fecha_inicio, fecha_fin, activa) VALUES "
                                + "(1, 222, 'PREMIUM', '2025-03-16', '2025-04-16', true),"
                                + "(2, 223, 'BASIC', '2025-03-16', '2025-04-16', true),"
                                + "(3, 224, 'GRATIS', '2025-03-16', NULL, true)");

                                // Execute batch
                                statement.executeBatch();
                                System.out.println("Batch execution completed successfully.");

                        }
        }
}