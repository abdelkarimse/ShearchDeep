package com.deepShearch.deepShearch.services;

import java.util.List;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.deepShearch.deepShearch.Dto.UserRepresentationwithBloced;
import com.deepShearch.deepShearch.Dto.WebsocketMessagae;
import com.deepShearch.deepShearch.Model.DocumentView;
import com.deepShearch.deepShearch.repository.DocumentViewRepository;
import com.deepShearch.deepShearch.services.interfaces.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final Keycloak keycloakAdminClient;
    private final DocumentViewRepository documentViewRepository;

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

    @Override
    public WebsocketMessagae getActions(WebsocketMessagae message) {

        List<UserRepresentation> allUsers = getAllUsers();
        String adminId = null;

        for (UserRepresentation user : allUsers) {
            List<String> roles = keycloakAdminClient
                    .realm(realm)
                    .users()
                    .get(user.getId())
                    .roles()
                    .realmLevel()
                    .listEffective()
                    .stream()
                    .map(r -> r.getName())
                    .toList();

            if (roles.contains("ADMIN")) {
                adminId = user.getId();
                break;
            }
        }

        WebsocketMessagae response = new WebsocketMessagae();
        if(message.getTypeMessage() == WebsocketMessagae.TypeMessage.CLOSEBOOKSVIWER){
            response.setSenderId(message.getSenderId());
            response.setReceiverId(adminId);
            response.setTypeMessage(WebsocketMessagae.TypeMessage.CLOSEBOOKSVIWER);
            return response;
        }
        if (message.getTypeMessage() == WebsocketMessagae.TypeMessage.DOCUMENT8Viewed) {
            response.setSenderId(message.getSenderId());
            response.setReceiverId(adminId);
            response.setTypeMessage(WebsocketMessagae.TypeMessage.GETBOOKSVIWER);
            if (message.getDocumentId() == null) {
                return response;
            }
            DocumentView docView = documentViewRepository
                    .findByDocumentId(Long.parseLong(message.getDocumentId()));


            UserRepresentation usersWithBlock = this.getUserById(message.getSenderId());
            UserRepresentationwithBloced u = new UserRepresentationwithBloced();
            u.setId(usersWithBlock.getId());
            u.setUsername(usersWithBlock.getUsername());
            u.setEmail(usersWithBlock.getEmail());
            boolean isBlocked = docView != null
                    && docView.getBlockedViwedByUsers() != null
                    && docView.getBlockedViwedByUsers().contains(Long.parseLong(usersWithBlock.getId()));
            u.setBlocked(isBlocked);
            u.setDocumentId(message.getDocumentId());
            response.setUser(u);
        } else if (message.getTypeMessage() == WebsocketMessagae.TypeMessage.Bloc_VIEWED) {
            if (message.getDocumentId() == null) {
                return response;
            }
            DocumentView docView = documentViewRepository
                    .findByDocumentId(Long.parseLong(message.getDocumentId()));
            if (docView == null) {
                return response;
            }
            docView.getBlockedViwedByUsers().add(message.getSenderId());
            documentViewRepository.save(docView);
            response.setSenderId(message.getSenderId());
            response.setReceiverId(adminId);

            response.setTypeMessage(WebsocketMessagae.TypeMessage.Bloc_VIEWED);
        }

        return response;
    }

}