package com.kaskita.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

@Configuration
public class FirestoreConfig {

    // "firebaseInitializer" is the explicit bean name declared in FirebaseConfig
    @Bean
    @DependsOn("firebaseInitializer")
    public Firestore getFirestore() {
        return FirestoreClient.getFirestore();
    }
}
