package com.camyo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		System.setProperty("CAMYO_APP_JWT_SECRET", dotenv.get("CAMYO_APP_JWT_SECRET"));
		System.setProperty("AES_KEY", dotenv.get("AES_KEY"));
		System.setProperty("AES_IV", dotenv.get("AES_IV"));
		SpringApplication.run(BackendApplication.class, args);
	}

}
