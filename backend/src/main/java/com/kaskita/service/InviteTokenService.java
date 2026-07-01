package com.kaskita.service;

import com.google.cloud.firestore.*;
import com.kaskita.model.InviteToken;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.ExecutionException;

@Service
public class InviteTokenService {

    private final Firestore firestore;
    private static final String COLLECTION_TOKENS = "invite_tokens";
    private static final String COLLECTION_USERS = "users";
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public InviteTokenService(Firestore firestore) {
        this.firestore = firestore;
    }

    public InviteToken generateToken() throws ExecutionException, InterruptedException {
        String token = generateUniqueToken();
        InviteToken inviteToken = InviteToken.builder()
                .token(token)
                .createdAt(System.currentTimeMillis())
                .used(false)
                .usedByUid(null)
                .build();
        firestore.collection(COLLECTION_TOKENS).document(token).set(inviteToken).get();
        return inviteToken;
    }

    public boolean redeemToken(String token, String memberUid) throws ExecutionException, InterruptedException {
        DocumentReference tokenRef = firestore.collection(COLLECTION_TOKENS).document(token.toUpperCase());
        DocumentSnapshot tokenDoc = tokenRef.get().get();

        if (!tokenDoc.exists()) {
            return false;
        }

        InviteToken inviteToken = tokenDoc.toObject(InviteToken.class);
        if (inviteToken == null || inviteToken.isUsed()) {
            return false;
        }

        tokenRef.update("used", true, "usedByUid", memberUid).get();

        DocumentReference userRef = firestore.collection(COLLECTION_USERS).document(memberUid);
        DocumentSnapshot userDoc = userRef.get().get();
        if (userDoc.exists()) {
            userRef.update("invited", true).get();
        }

        return true;
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