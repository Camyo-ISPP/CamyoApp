package com.camyo.backend.util;

import com.camyo.backend.exceptions.InvalidNifException;

public class Validators {
    public static void comprobarNif(String nif) throws InvalidNifException {
        if (nif.length() != 9){
            throw new InvalidNifException();
        }
        nif = nif.toUpperCase();

        // NIF de personas físicas: empieza con un número, o con una X, Y o Z si es un NIE.
        char primera = nif.charAt(0);
        if (primera >= '0' && primera <= '9' || primera >= 'K' && primera <= 'M' || primera >= 'X' && primera <= 'Z') {
            String secuenciaLetrasNIF = "TRWAGMYFPDXBNJZSQVHLCKE";
            String numeroNIF = nif.substring(0, nif.length()-1);
            // Si es un NIE, reemplazamos letra inicial por su valor numérico.
            numeroNIF = numeroNIF.replace("X", "0").replace("Y", "1").replace("Z", "2");
            char letraNIF = nif.charAt(8);
            int i = Integer.parseInt(numeroNIF) % 23;
            if (letraNIF != secuenciaLetrasNIF.charAt(i)) {
                throw new InvalidNifException();
            }
        } else {
            String secuenciaLetrasNIF = "JABCDEFGHI";
            // NIF de personas jurídicas y entidades: el código de control se obtiene utilizando el número de 7 cifras
            String numeroNIF = nif.substring(1, nif.length()-1);
            // Se suman las posiciones pares de los 7 dígitos centrales
            Integer sumaPares = 0;
            for (int i = 1; i <= numeroNIF.length()-1; i += 2) {
                sumaPares += Character.getNumericValue(numeroNIF.charAt(i));
            }

            // Se multiplica cada dígito impar por 2 y se suman las cifras si el resultado tiene más de un dígito
            Integer sumaImpares = 0;
            for (int i = 0; i <= numeroNIF.length(); i += 2) {
                String digitos = String.valueOf(Character.getNumericValue(numeroNIF.charAt(i)) * 2);
                for (int j = 0; j < digitos.length(); j++) {
                    sumaImpares += Character.getNumericValue(digitos.charAt(j));
                }
            }

            // Se calcula el código de control
            Integer numeroControl;
            if ((sumaPares + sumaImpares) % 10 != 0) {
                numeroControl = 10 - (sumaPares + sumaImpares) % 10;
            } else {
                numeroControl = 0;
            }

            // Por último, se comprueba que el número de control calculado coincida con el proporcionado
            // o que el código de control corresponda al de la tabla
            char control = nif.charAt(nif.length()-1);
            if (Character.getNumericValue(control) != numeroControl && control != secuenciaLetrasNIF.charAt(numeroControl)) {
                throw new InvalidNifException();
            }
        }
    }
}
