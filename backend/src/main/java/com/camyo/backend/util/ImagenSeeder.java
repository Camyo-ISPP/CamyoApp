package com.camyo.backend.util;

import org.springframework.core.io.ClassPathResource;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;

@Component
@Profile("imagenes")
public class ImagenSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public ImagenSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        asignarImagenes(201, 19, "camionero");
        asignarImagenes(202, 10, "empresa");
        asignarImagenes(203, 1, "admin");

        asignarImagenConcreta(239L, "gato.png");
        asignarImagenConcreta(240L, "mopa.png");
        asignarImagenConcreta(246L, "camyo.png");
    }

    private void asignarImagenes(int authorityId, int numImagenes, String tipo) {
        // Cachear las imágenes en memoria
        HashMap<Integer, byte[]> imagenesCache = new HashMap<>();
        for (int i = 1; i <= numImagenes; i++) {
            String filename = "seed-imagenes/" + tipo + i + ".png";
            try {
                ClassPathResource resource = new ClassPathResource(filename);
                try (InputStream in = resource.getInputStream()) {
                    imagenesCache.put(i, in.readAllBytes());
                    System.out.println("Cargada " + filename);
                }
            } catch (Exception e) {
                System.out.println("Error cargando " + filename + ": " + e.getMessage());
            }
        }

        // Obtener usuarios y asignar imágenes desde el caché
        List<Long> userIds = jdbcTemplate.queryForList(
                "SELECT id FROM usuario WHERE authority = ?",
                Long.class,
                authorityId);

        for (int i = 0; i < userIds.size(); i++) {
            Long userId = userIds.get(i);
            int imgIndex = (i % numImagenes) + 1;
            byte[] imageBytes = imagenesCache.get(imgIndex);
            if (imageBytes == null)
                continue;

            jdbcTemplate.update(
                    "UPDATE usuario SET foto = ? WHERE id = ? AND foto IS NULL",
                    imageBytes, userId);
        }
    }

    private void asignarImagenConcreta(Long userId, String nombreArchivo) {
        String filename = "seed-imagenes/" + nombreArchivo;
        try {
            ClassPathResource resource = new ClassPathResource(filename);
            try (InputStream in = resource.getInputStream()) {
                byte[] imageBytes = in.readAllBytes();
                jdbcTemplate.update("UPDATE usuario SET foto = ? WHERE id = ?", imageBytes, userId);
                System.out.println("Imagen " + nombreArchivo + " asignada al usuario ID " + userId);
            }
        } catch (Exception e) {
            System.out
                    .println("Error asignando " + nombreArchivo + " al usuario ID " + userId + ": " + e.getMessage());
        }
    }

}
