package com.deepShearch.deepShearch.controller;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import com.deepShearch.deepShearch.Model.Notification;
import com.deepShearch.deepShearch.services.interfaces.NotificationService;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    
    private NotificationService notificationService;
    private SimpMessagingTemplate messagingTemplate;

    
    @MessageMapping("/notification/{ueserId}")
    public void getNotfications( @DestinationVariable String ueserId) {
        if (ueserId == null) {
            messagingTemplate.convertAndSendToUser(ueserId, "/queue/notifications", null);
            return;
        }
        List<Notification> notifications = notificationService.getNotificationsByUserId(ueserId);
        messagingTemplate.convertAndSendToUser(ueserId, "/queue/notifications", convertToResponse(notifications));
    }



    @MessageMapping("/makedAllAsRead/{ueserId}")
    public void makedAllAsRead( @DestinationVariable String ueserId) {
        if (ueserId == null) {
            messagingTemplate.convertAndSendToUser(ueserId, "/queue/notifications", null);
            return;
        }
        notificationService.markAllAsRead(ueserId);
        List<Notification> notifications = notificationService.getNotificationsByUserId(ueserId);
        messagingTemplate.convertAndSendToUser(ueserId, "/queue/notifications", convertToResponse(notifications));
    }



    // Helper method to convert list of notifications to response format
    private List<Map<String, Object>> convertToResponse(List<Notification> notifications) {
        return notifications.stream()
            .map(this::convertToResponseItem)
            .collect(Collectors.toList());
    }
    
    // Helper method to convert notification to response format matching TypeScript interface
    private Map<String, Object> convertToResponseItem(Notification notification) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", notification.getId());
        response.put("title", notification.getTitle());
        response.put("message", notification.getMessage());
        response.put("time", formatTimeAgo(notification.getCreatedAt()));
        response.put("type", notification.getType().name().toLowerCase());
        response.put("isRead", notification.getIsRead());
        response.put("userId", notification.getUserId());
        response.put("createdAt", notification.getCreatedAt().toString());
        return response;
    }
    
    // Helper method to format time as "X min ago", "X hours ago", etc.
    private String formatTimeAgo(LocalDateTime createdAt) {
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(createdAt, now);
        
        long seconds = duration.getSeconds();
        
        if (seconds < 60) {
            return seconds + " sec ago";
        } else if (seconds < 3600) {
            long minutes = seconds / 60;
            return minutes + " min ago";
        } else if (seconds < 86400) {
            long hours = seconds / 3600;
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        } else if (seconds < 604800) {
            long days = seconds / 86400;
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        } else if (seconds < 2592000) {
            long weeks = seconds / 604800;
            return weeks + " week" + (weeks > 1 ? "s" : "") + " ago";
        } else if (seconds < 31536000) {
            long months = seconds / 2592000;
            return months + " month" + (months > 1 ? "s" : "") + " ago";
        } else {
            long years = seconds / 31536000;
            return years + " year" + (years > 1 ? "s" : "") + " ago";
        }
    }
}
