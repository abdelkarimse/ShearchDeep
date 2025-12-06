package com.deepShearch.deepShearch.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakAdminClientConfig {
    @Value("${host.keycloak.auth-server-url:http://localhost:8080}")
    private String serverUrl;

    @Value("${host.keycloak.realm:MyRealmDeepSearch}")
    private String realm;

    @Value("${host.keycloak.resource:backend-DeepSearch-service}")
    private String clientId;

    @Value("${host.keycloak.credentials.secret:789c4e5f-1234-5678-9abc-def012345678}")
    private String clientSecret;

    @Bean
    public Keycloak keycloakAdminClient() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .build();
    }
}
