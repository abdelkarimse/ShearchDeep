package com.deepShearch.deepShearch.services;

import java.util.List;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.deepShearch.deepShearch.services.interfaces.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final Keycloak keycloakAdminClient;
    
    @Value("${host.keycloak.realm:MyRealmDeepSearch}")
    private String realm;
    
    @Override
    public void createUser(String username, String email, String password) {

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false);
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);

        UserRepresentation user = new UserRepresentation();
        user.setUsername(username);
        user.setEmail(email);
        user.setCredentials(List.of(credential));
        user.setEnabled(true);

        UsersResource usersResource = keycloakAdminClient.realm(realm).users();
        usersResource.create(user);
    }

    @Override
    public UserRepresentation getUserById(String userId) {
        UsersResource usersResource = keycloakAdminClient.realm(realm).users();
        return usersResource.get(userId).toRepresentation();
    }

    @Override
    public UserRepresentation getUserByUsername(String username) {
        UsersResource usersResource = keycloakAdminClient.realm(realm).users();
        List<UserRepresentation> users = usersResource.search(username);
        return users.isEmpty() ? null : users.get(0);
    }

    @Override
    public List<UserRepresentation> getAllUsers() {
        UsersResource usersResource = keycloakAdminClient.realm(realm).users();
        return usersResource.list();
    }

    @Override
    public void updateUser(String userId, UserRepresentation user) {
        UsersResource usersResource = keycloakAdminClient.realm(realm).users();
        usersResource.get(userId).update(user);
    }

    @Override
    public void deleteUser(String userId) {
        UsersResource usersResource = keycloakAdminClient.realm(realm).users();
        usersResource.get(userId).remove();
    }

}
