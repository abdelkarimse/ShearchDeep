package com.deepShearch.deepShearch.services.interfaces;

import java.util.List;
import java.util.Optional;

import com.deepShearch.deepShearch.Model.Notification;

public interface NotificationService {


    List<Notification> getNotificationsByUserId(String userId);

    Notification createNotification(Notification notification);

    void markAllAsRead( String userId);

}
