package com.deepShearch.deepShearch.services;

import com.deepShearch.deepShearch.services.interfaces.UserService;
import lombok.AllArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    private Keycloak keycloakAdminClient;
    
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

        UsersResource usersResource = keycloakAdminClient.realm("master").users();
        usersResource.create(user);
    }

    @Override
    public UserRepresentation getUserById(String userId) {
        UsersResource usersResource = keycloakAdminClient.realm("master").users();
        return usersResource.get(userId).toRepresentation();
    }

    @Override
    public UserRepresentation getUserByUsername(String username) {
        UsersResource usersResource = keycloakAdminClient.realm("master").users();
        List<UserRepresentation> users = usersResource.search(username);
        return users.isEmpty() ? null : users.get(0);
    }

    @Override
    public List<UserRepresentation> getAllUsers() {
        UsersResource usersResource = keycloakAdminClient.realm("master").users();
        return usersResource.list();
    }

    @Override
    public void updateUser(String userId, UserRepresentation user) {
        UsersResource usersResource = keycloakAdminClient.realm("master").users();
        usersResource.get(userId).update(user);
    }

    @Override
    public void deleteUser(String userId) {
        UsersResource usersResource = keycloakAdminClient.realm("master").users();
        usersResource.get(userId).remove();
    }

}
