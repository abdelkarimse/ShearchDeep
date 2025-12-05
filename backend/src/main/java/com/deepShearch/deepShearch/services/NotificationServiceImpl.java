package com.deepShearch.deepShearch.services;

import java.util.List;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.deepShearch.deepShearch.Model.Notification;
import com.deepShearch.deepShearch.repository.NotificationRepository;
import com.deepShearch.deepShearch.services.interfaces.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    private NotificationRepository notificationRepository;
    private SimpMessagingTemplate messagingTemplate;


    @Override
    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional
    public void markAllAsRead( String userId) {
        notificationRepository.markAllAsRead( userId);
    }

    @Override
    public Notification createNotification(Notification notification) {
        Notification savedNotification = notificationRepository.save(notification);

        // Send notification via WebSocket
        if (notification.getUserId() != null) {
            messagingTemplate.convertAndSendToUser(
                    notification.getUserId(),
                    "/queue/notifications",
                    savedNotification
            );
        } else {
            // Broadcast to all users
            messagingTemplate.convertAndSend("/topic/notifications", savedNotification);
        }

        return savedNotification;
    }


}
