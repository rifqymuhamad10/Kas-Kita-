package com.kaskita.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.kaskita.model.Bill;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class BillService {
    private final Firestore firestore;
    private static final String COLLECTION_BILLS = "bills";

    public BillService(Firestore firestore) {
        this.firestore = firestore;
    }

    public List<Bill> getBillsByMemberUid(String memberUid) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_BILLS)
                .whereEqualTo("memberUid", memberUid)
                .get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Bill> bills = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            bills.add(document.toObject(Bill.class));
        }
        return bills;
    }

    public List<Bill> getAllBills() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_BILLS).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Bill> bills = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            bills.add(document.toObject(Bill.class));
        }
        return bills;
    }
}
