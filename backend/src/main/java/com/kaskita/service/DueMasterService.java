package com.kaskita.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.kaskita.model.DueMaster;
import com.kaskita.model.Bill;
import com.kaskita.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class DueMasterService {

    private final Firestore firestore;
    private static final String COLLECTION_DUEMASTER = "due_master";
    private static final String COLLECTION_BILLS = "bills";
    private static final String COLLECTION_USERS = "users";

    public DueMasterService(Firestore firestore) {
        this.firestore = firestore;
    }

    public DueMaster createDueMaster(DueMaster dueMaster) throws ExecutionException, InterruptedException {
        if (dueMaster.getId() == null || dueMaster.getId().isEmpty()) {
            dueMaster.setId(UUID.randomUUID().toString());
        }
        if (dueMaster.getCreatedAt() == null) {
            dueMaster.setCreatedAt(System.currentTimeMillis());
        }

        // Save DueMaster
        firestore.collection(COLLECTION_DUEMASTER).document(dueMaster.getId()).set(dueMaster).get();

        // Generate Bills for all invited members (Filtered in-memory to avoid Firestore composite index requirement)
        List<QueryDocumentSnapshot> users = firestore.collection(COLLECTION_USERS)
                .whereEqualTo("role", "ROLE_MEMBER")
                .get().get().getDocuments();

        for (QueryDocumentSnapshot userDoc : users) {
            User user = userDoc.toObject(User.class);
            if (user.isInvited()) {
                Bill bill = Bill.builder()
                        .id(UUID.randomUUID().toString())
                        .memberUid(user.getUid())
                        .dueMasterId(dueMaster.getId())
                        .amountDue(dueMaster.getAmount())
                        .status("UNPAID")
                        .build();
                firestore.collection(COLLECTION_BILLS).document(bill.getId()).set(bill);
            }
        }

        return dueMaster;
    }

    public List<DueMaster> getAllDueMasters() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_DUEMASTER).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<DueMaster> dueMasters = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            dueMasters.add(document.toObject(DueMaster.class));
        }
        return dueMasters;
    }

    public void deleteDueMaster(String id) throws ExecutionException, InterruptedException {
        // Delete DueMaster
        firestore.collection(COLLECTION_DUEMASTER).document(id).delete().get();

        // Delete associated Bills
        List<QueryDocumentSnapshot> bills = firestore.collection(COLLECTION_BILLS)
                .whereEqualTo("dueMasterId", id)
                .get().get().getDocuments();

        WriteBatch batch = firestore.batch();
        for (QueryDocumentSnapshot billDoc : bills) {
            batch.delete(billDoc.getReference());
        }
        batch.commit().get();
    }
}
