package com.deepShearch.deepShearch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

@Configuration
@EnableWebSecurity
class SecurityCongfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
       return  http
               .csrf().disable()
               .authorizeHttpRequests(auth -> auth
                       .requestMatchers("/api/V1/documents/mayan/**").permitAll()
                       .anyRequest().permitAll())
        .addFilterAfter(new CustomSecurityFilter(), BasicAuthenticationFilter.class)
        .build();
    }
}