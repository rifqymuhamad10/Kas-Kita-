package com.kaskita.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

@Configuration
public class FirestoreConfig {

    @Bean
    @DependsOn("firebaseConfig") // Pastikan FirebaseApp diinisialisasi lebih dulu
    public Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }
}
