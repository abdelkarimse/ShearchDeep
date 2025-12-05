package com.deepShearch.deepShearch.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class KeycloakAdminClientConfig {
    private final String serverUrl = "http://192.168.40.255/:80";
    private final String realm = "master";
    private final String clientId = "spring-boot";
    private final String clientSecret = "ekhnmyrdoYyjdriDTuFTxiK0JD1rCn4I"; // The client secret

    @Bean
    public Keycloak keycloakAdminClient() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS) // Use client credentials flow for service account
                .build();
    }
}
