package com.deepShearch.deepShearch.services.interfaces;

import org.keycloak.representations.idm.UserRepresentation;

import java.util.List;

public interface UserService {
    
    void createUser(String username, String email, String password);
    
    UserRepresentation getUserById(String userId);
    
    UserRepresentation getUserByUsername(String username);
    
    List<UserRepresentation> getAllUsers();
    
    void updateUser(String userId, UserRepresentation user);
    
    void deleteUser(String userId);
}
