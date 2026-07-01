package com.kaskita.controller;

import com.google.cloud.firestore.Firestore;
import com.kaskita.model.TelegramVerificationToken;
import com.kaskita.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/telegram")
public class TelegramController {

    private final Firestore firestore;
    private final String botUsername;
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final String COLLECTION_TOKENS = "telegram_tokens";

    public TelegramController(Firestore firestore,
                              @Value("${telegram.bot.username}") String botUsername) {
        this.firestore = firestore;
        this.botUsername = botUsername;
    }

    @PostMapping("/generate-link")
    public ResponseEntity<?> generateTelegramLink() {
        try {
            // Ambil user yang sedang login dari SecurityContext
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User)) {
                return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
            }
            User user = (User) principal;

            String token = generateUniqueToken();

            TelegramVerificationToken verificationToken = TelegramVerificationToken.builder()
                    .token(token)
                    .userUid(user.getUid())
                    .createdAt(System.currentTimeMillis())
                    .used(false)
                    .build();

            // Simpan token ke Firestore
            firestore.collection(COLLECTION_TOKENS).document(token).set(verificationToken).get();

            String telegramUrl = "https://t.me/" + botUsername + "?start=" + token;

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "telegramUrl", telegramUrl
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    private String generateUniqueToken() throws ExecutionException, InterruptedException {
        Random random = new Random();
        String token;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
            }
            token = sb.toString();
        } while (firestore.collection(COLLECTION_TOKENS).document(token).get().get().exists());
        return token;
    }
}
