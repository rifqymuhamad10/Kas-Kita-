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
                .invited(false) // By default, new members are not invited
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

    public java.util.List<User> getAllMembers() throws ExecutionException, InterruptedException {
        com.google.cloud.firestore.QuerySnapshot querySnapshot = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("role", "ROLE_MEMBER")
                .get().get();
        java.util.List<User> members = new java.util.ArrayList<>();
        for (DocumentSnapshot doc : querySnapshot.getDocuments()) {
            members.add(doc.toObject(User.class));
        }
        return members;
    }

    public User inviteUser(String uid) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(uid);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot document = future.get();
        
        if (document.exists()) {
            User user = document.toObject(User.class);
            user.setInvited(true);
            docRef.set(user).get();
            return user;
        }
        return null;
    }
}
