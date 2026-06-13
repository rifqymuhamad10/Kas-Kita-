package com.kaskita.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.kaskita.model.Dues;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class DuesService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "dues";

    public DuesService(Firestore firestore) {
        this.firestore = firestore;
    }

    public String recordPayment(Dues dues) throws ExecutionException, InterruptedException {
        if (dues.getId() == null || dues.getId().isEmpty()) {
            dues.setId(UUID.randomUUID().toString());
        }
        if ("PAID".equalsIgnoreCase(dues.getStatus()) && dues.getPaymentDate() == null) {
            dues.setPaymentDate(System.currentTimeMillis());
        }
        
        ApiFuture<WriteResult> collectionsApiFuture = firestore.collection(COLLECTION_NAME).document(dues.getId()).set(dues);
        return collectionsApiFuture.get().getUpdateTime().toString();
    }

    public List<Dues> getDuesByMonth(String monthPeriod) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("monthPeriod", monthPeriod)
                .get();
                
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Dues> duesList = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            duesList.add(document.toObject(Dues.class));
        }
        return duesList;
    }
}
