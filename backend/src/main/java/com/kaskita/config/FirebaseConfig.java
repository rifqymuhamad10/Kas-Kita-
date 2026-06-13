package com.kaskita.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    /**
     * Initialize Firebase Admin SDK as a Spring Bean.
     * Named "firebaseInitializer" so that FirestoreConfig can @DependsOn it reliably.
     * Tries classpath first (local dev), falls back to Application Default Credentials (production).
     */
    @Bean(name = "firebaseInitializer")
    public FirebaseApp initFirebase() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            logger.info("Firebase already initialized, reusing existing app.");
            return FirebaseApp.getInstance();
        }

        FirebaseOptions options;
        InputStream serviceAccount = getClass().getClassLoader()
                .getResourceAsStream("firebase-service-account.json");

        if (serviceAccount != null) {
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            logger.info("Firebase initialized with credentials from classpath.");
        } else {
            options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.getApplicationDefault())
                    .build();
            logger.info("Firebase initialized with Application Default Credentials.");
        }

        return FirebaseApp.initializeApp(options);
    }
}
