package com.kaskita.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.kaskita.model.Transaction;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class TransactionService {

    private final Firestore firestore;
    private static final String COLLECTION_NAME = "transactions";

    public TransactionService(Firestore firestore) {
        this.firestore = firestore;
    }

    public String addTransaction(Transaction transaction) throws ExecutionException, InterruptedException {
        if (transaction.getId() == null || transaction.getId().isEmpty()) {
            transaction.setId(UUID.randomUUID().toString());
        }
        if (transaction.getTimestamp() == null) {
            transaction.setTimestamp(System.currentTimeMillis());
        }
        
        ApiFuture<WriteResult> collectionsApiFuture = firestore.collection(COLLECTION_NAME).document(transaction.getId()).set(transaction);
        return collectionsApiFuture.get().getUpdateTime().toString();
    }

    public List<Transaction> getAllTransactions() throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> future = firestore.collection(COLLECTION_NAME)
                .orderBy("timestamp", Query.Direction.DESCENDING)
                .get();
                
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Transaction> transactions = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            transactions.add(document.toObject(Transaction.class));
        }
        return transactions;
    }

    public Double getTotalBalance() throws ExecutionException, InterruptedException {
        List<Transaction> transactions = getAllTransactions();
        double balance = 0.0;
        for (Transaction t : transactions) {
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                balance += t.getAmount() != null ? t.getAmount() : 0.0;
            } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                balance -= t.getAmount() != null ? t.getAmount() : 0.0;
            }
        }
        return balance;
    }

    public String updateTransaction(String id, Transaction transaction) throws ExecutionException, InterruptedException {
        transaction.setId(id);
        if (transaction.getTimestamp() == null) {
            transaction.setTimestamp(System.currentTimeMillis());
        }
        ApiFuture<WriteResult> collectionsApiFuture = firestore.collection(COLLECTION_NAME).document(id).set(transaction);
        return collectionsApiFuture.get().getUpdateTime().toString();
    }

    public void deleteTransaction(String id) throws ExecutionException, InterruptedException {
        ApiFuture<WriteResult> writeResult = firestore.collection(COLLECTION_NAME).document(id).delete();
        writeResult.get();
    }
}
