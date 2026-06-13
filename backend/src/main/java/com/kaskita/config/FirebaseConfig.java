package com.kaskita.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void initFirebase() {
        if (FirebaseApp.getApps().isEmpty()) {
            try {
                FirebaseOptions options;
                InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
                
                if (serviceAccount != null) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    logger.info("Initializing Firebase with credentials from classpath: firebase-service-account.json");
                } else {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                    logger.info("Initializing Firebase with Application Default Credentials.");
                }

                FirebaseApp.initializeApp(options);
                logger.info("Firebase has been initialized successfully");
            } catch (Exception e) {
                logger.error("Error initializing Firebase", e);
            }
        }
    }
}
