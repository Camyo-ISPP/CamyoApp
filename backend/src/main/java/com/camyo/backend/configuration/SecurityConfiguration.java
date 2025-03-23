package com.camyo.backend.configuration;

import static org.springframework.security.config.Customizer.withDefaults;
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.camyo.backend.configuration.jwt.AuthEntryPointJwt;
import com.camyo.backend.configuration.jwt.AuthTokenFilter;
import org.springframework.http.HttpMethod;
import com.camyo.backend.configuration.services.UserDetailsServiceImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

	@Autowired
	UserDetailsServiceImpl userDetailsService;

	@Autowired
	private AuthEntryPointJwt unauthorizedHandler;

	@Autowired
	DataSource dataSource;	

	@Bean
	protected SecurityFilterChain configure(HttpSecurity http) throws Exception {
		
		http
			.cors(withDefaults())		
			.csrf(AbstractHttpConfigurer::disable)		
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))			
			.headers((headers) -> headers.frameOptions((frameOptions) -> frameOptions.disable()))
			.exceptionHandling((exepciontHandling) -> exepciontHandling.authenticationEntryPoint(unauthorizedHandler))			
			
			.authorizeHttpRequests(authorizeRequests -> authorizeRequests
			//.requestMatchers("/resources/**", "/webjars/**", "/static/**", "/swagger-resources/**").permitAll()			
			//.requestMatchers( "/","/auth/**","/swagger-ui.html","/swagger-ui/**").permitAll()
			.requestMatchers("/usuarios/**").permitAll()
			.requestMatchers(HttpMethod.PUT, "/ofertas/{id}/desaplicar/**").hasAuthority("CAMIONERO")
			.requestMatchers(HttpMethod.PUT, "/ofertas/{id}/aplicar/**").hasAuthority("CAMIONERO")


			.requestMatchers(HttpMethod.POST, "/ofertas/{id}/trabajo").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.PUT, "/ofertas/{id}/trabajo").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.DELETE, "/ofertas/{id}/trabajo").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.POST, "/ofertas/{id}/carga").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.PUT, "/ofertas/{id}/carga").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.DELETE, "/ofertas/{id}/carga").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.POST, "/ofertas").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.PUT, "/ofertas/**").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.DELETE, "/ofertas/**").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.GET, "/ofertas/{id}/camioneros").hasAnyAuthority("EMPRESA", "CAMIONERO")

			.requestMatchers(HttpMethod.GET, "/resenas").hasAnyAuthority("EMPRESA", "CAMIONERO")

			.requestMatchers(HttpMethod.PUT, "/camioneros/**").hasAuthority("CAMIONERO")
			.requestMatchers(HttpMethod.DELETE, "/camioneros/**").hasAuthority("CAMIONERO")
			.requestMatchers(HttpMethod.PUT, "/empresas/**").hasAuthority("EMPRESA")
			.requestMatchers(HttpMethod.DELETE, "/empresas/**").hasAuthority("EMPRESA")

			.anyRequest().permitAll()
			)
							 
			
			.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);		
		return http.build();
	}

	@Bean
	public AuthTokenFilter authenticationJwtTokenFilter() {
		return new AuthTokenFilter();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
		return config.getAuthenticationManager();
	}	

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
}
