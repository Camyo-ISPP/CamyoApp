package com.camyo.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.load();
		System.setProperty("CAMYO_APP_JWT_SECRET", dotenv.get("CAMYO_APP_JWT_SECRET"));
		SpringApplication.run(BackendApplication.class, args);
	}

}
