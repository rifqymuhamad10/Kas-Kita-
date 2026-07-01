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
        
        // 1. Coba dari environment variable (paling cocok untuk deployment Cloud)
        String firebaseCredentialsJson = System.getenv("FIREBASE_CREDENTIALS_JSON");
        if (firebaseCredentialsJson != null && !firebaseCredentialsJson.trim().isEmpty()) {
            try (InputStream stream = new java.io.ByteArrayInputStream(
                    firebaseCredentialsJson.getBytes(java.nio.charset.StandardCharsets.UTF_8))) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(stream))
                        .build();
                logger.info("Firebase initialized with credentials from FIREBASE_CREDENTIALS_JSON environment variable.");
            }
        } else {
            // 2. Coba dari file local classpath (development)
            InputStream serviceAccount = getClass().getClassLoader()
                    .getResourceAsStream("firebase-service-account.json");
            if (serviceAccount != null) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                logger.info("Firebase initialized with credentials from classpath.");
            } else {
                // 3. Fallback ke Application Default Credentials
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.getApplicationDefault())
                        .build();
                logger.info("Firebase initialized with Application Default Credentials.");
            }
        }

        return FirebaseApp.initializeApp(options);
    }
}
