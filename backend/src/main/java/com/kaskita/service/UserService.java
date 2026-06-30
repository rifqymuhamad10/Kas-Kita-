package com.kaskita.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.kaskita.model.User;
import com.kaskita.model.dto.RegisterRequest;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

@Service
public class UserService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "users";

    public UserService(Firestore firestore) {
        this.firestore = firestore;
    }

    public User registerUser(RegisterRequest request) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(request.getUid());
        
        // Ensure user does not already exist
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        if (document.exists()) {
            throw new IllegalArgumentException("User with this UID already exists.");
        }

        String role = "ROLE_MEMBER";

        User newUser = User.builder()
                .uid(request.getUid())
                .name(request.getName())
                .email(request.getEmail())
                .role(role)
                .active(true)
                .fcmToken(null)
                .build();

        // Save to Firestore
        docRef.set(newUser).get();
        
        return newUser;
    }

    public User getUserByUid(String uid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(uid);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            return document.toObject(User.class);
        }
        return null; // Return null if user not found in Firestore
    }
}
