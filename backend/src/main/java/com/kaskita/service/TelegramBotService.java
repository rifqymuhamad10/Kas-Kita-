package com.kaskita.service;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.kaskita.model.TelegramVerificationToken;
import com.kaskita.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.concurrent.ExecutionException;

@Service
public class TelegramBotService extends TelegramLongPollingBot {

    private final Firestore firestore;
    private final String botToken;
    private final String botUsername;

    private static final String COLLECTION_USERS = "users";
    private static final String COLLECTION_TOKENS = "telegram_tokens";

    public TelegramBotService(Firestore firestore,
                              @Value("${telegram.bot.token}") String botToken,
                              @Value("${telegram.bot.username}") String botUsername) {
        super(botToken);
        this.firestore = firestore;
        this.botToken = botToken;
        this.botUsername = botUsername;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            if (messageText.startsWith("/start")) {
                handleStartCommand(chatId, messageText);
            } else {
                sendTextMessage(chatId, "Halo! Silakan hubungkan akun Anda dari dashboard Kas Kita terlebih dahulu.");
            }
        }
    }

    private void handleStartCommand(long chatId, String messageText) {
        String[] parts = messageText.split("\\s+");
        if (parts.length < 2) {
            sendTextMessage(chatId, "Format salah. Silakan klik tombol 'Hubungkan Telegram' dari dashboard aplikasi Kas Kita.");
            return;
        }

        String token = parts[1].trim().toUpperCase();

        try {
            DocumentReference tokenRef = firestore.collection(COLLECTION_TOKENS).document(token);
            DocumentSnapshot tokenDoc = tokenRef.get().get();

            if (!tokenDoc.exists()) {
                sendTextMessage(chatId, "Token tidak valid atau sudah kedaluwarsa.");
                return;
            }

            TelegramVerificationToken verificationToken = tokenDoc.toObject(TelegramVerificationToken.class);
            if (verificationToken == null || verificationToken.isUsed()) {
                sendTextMessage(chatId, "Token sudah pernah digunakan.");
                return;
            }

            // Validasi masa berlaku token (15 menit = 900000 ms)
            long elapsed = System.currentTimeMillis() - verificationToken.getCreatedAt();
            if (elapsed > 900000) {
                sendTextMessage(chatId, "Token telah kedaluwarsa (berlaku 15 menit). Silakan generate ulang token baru.");
                return;
            }

            String userUid = verificationToken.getUserUid();
            DocumentReference userRef = firestore.collection(COLLECTION_USERS).document(userUid);
            DocumentSnapshot userDoc = userRef.get().get();

            if (!userDoc.exists()) {
                sendTextMessage(chatId, "User tidak ditemukan di sistem.");
                return;
            }

            // Update user status di Firestore
            userRef.update("telegramChatId", String.valueOf(chatId), "telegramLinked", true).get();

            // Tandai token telah digunakan
            tokenRef.update("used", true).get();

            User user = userDoc.toObject(User.class);
            String name = user != null ? user.getName() : "Siswa";

            sendTextMessage(chatId, "✅ Selamat " + name + "! Akun Kas Kita Anda berhasil terhubung dengan Telegram.\n" +
                    "Anda akan menerima notifikasi pengingat iuran kas di sini.");

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            sendTextMessage(chatId, "Terjadi kesalahan sistem saat memproses token.");
        }
    }

    public boolean sendReminder(String telegramChatId, String messageText) {
        try {
            SendMessage message = SendMessage.builder()
                    .chatId(telegramChatId)
                    .text(messageText)
                    .build();
            execute(message);
            return true;
        } catch (TelegramApiException e) {
            e.printStackTrace();
            return false;
        }
    }

    private void sendTextMessage(long chatId, String text) {
        try {
            SendMessage message = SendMessage.builder()
                    .chatId(String.valueOf(chatId))
                    .text(text)
                    .build();
            execute(message);
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }
    }
}
