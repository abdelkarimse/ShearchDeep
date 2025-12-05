package com.deepShearch.deepShearch.controller;

import java.util.List;

import com.deepShearch.deepShearch.Dto.WebsocketMessagae;
import com.deepShearch.deepShearch.Model.Notification;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.deepShearch.deepShearch.services.interfaces.UserService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/V1/users")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class UserController {
    private UserService userService;
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<UserRepresentation>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    @MessageMapping("/action")
    public void makedAllAsRead(@RequestBody WebsocketMessagae message) {
        if (message == null || message.getSenderId() == null) {
            return;
        }
        // todo: process the action from message
        messagingTemplate.convertAndSendToUser(message.getSenderId(), "/queue/action", null);
    }



    @GetMapping("/{userId}")
    public ResponseEntity<UserRepresentation> getUserById(@PathVariable String userId) {
        UserRepresentation user = userService.getUserById(userId);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserRepresentation> getUserByUsername(@PathVariable String username) {
        UserRepresentation user = userService.getUserByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Void> createUser(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password) {
        userService.createUser(username, email, password);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(
            @PathVariable String userId,
            @RequestBody UserRepresentation user) {
        userService.updateUser(userId, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
