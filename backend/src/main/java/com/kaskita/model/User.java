package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    private String uid;
    private String name;
    private String email;
    private String role;
    private boolean active; // Renamed from 'isActive' to avoid Lombok/Firestore getter mismatch
    private boolean invited; // Menandakan apakah member sudah diundang oleh admin
    private String fcmToken;
    private String telegramChatId;
    private boolean telegramLinked;
    private String photoUrl;
}

