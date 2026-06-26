package com.kaskita.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.kaskita.model.Target;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class TargetService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "targets";

    public TargetService(Firestore firestore) {
        this.firestore = firestore;
    }

    public String createTarget(Target target) throws ExecutionException, InterruptedException {
        if (target.getId() == null || target.getId().isEmpty()) {
            target.setId(UUID.randomUUID().toString());
        }
        if (target.getCreatedAt() == null) {
            target.setCreatedAt(System.currentTimeMillis());
        }
        if (target.getStatus() == null || target.getStatus().isEmpty()) {
            target.setStatus("ACTIVE");
        }

        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME)
                .document(target.getId()).set(target);
        return future.get().getUpdateTime().toString();
    }

    public List<Target> getAllTargets() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Target> targets = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            targets.add(document.toObject(Target.class));
        }
        return targets;
    }

    public Target getTargetById(String id) throws ExecutionException, InterruptedException {
        DocumentSnapshot document = firestore.collection(COLLECTION_NAME)
                .document(id).get().get();
        if (document.exists()) {
            return document.toObject(Target.class);
        }
        return null;
    }

    public List<Target> getActiveTargets() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .whereEqualTo("status", "ACTIVE")
                .get();

        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Target> targets = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            targets.add(document.toObject(Target.class));
        }
        return targets;
    }

    public String updateTarget(String id, Target target) throws ExecutionException, InterruptedException {
        target.setId(id);
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME)
                .document(id).set(target, SetOptions.merge());
        return future.get().getUpdateTime().toString();
    }

    public String deleteTarget(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> future = firestore.collection(COLLECTION_NAME)
                .document(id).delete();
        return future.get().getUpdateTime().toString();
    }
}
