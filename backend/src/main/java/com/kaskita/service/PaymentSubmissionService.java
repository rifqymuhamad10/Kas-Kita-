package com.kaskita.service;

import com.google.cloud.firestore.*;
import com.kaskita.model.PaymentSubmission;
import com.kaskita.model.Bill;
import com.kaskita.model.Transaction;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class PaymentSubmissionService {
    private final Firestore firestore;
    private static final String COLLECTION_PAYMENTS = "payment_submissions";
    private static final String COLLECTION_BILLS = "bills";
    private static final String COLLECTION_TRANSACTIONS = "transactions";

    public PaymentSubmissionService(Firestore firestore) {
        this.firestore = firestore;
    }

    public PaymentSubmission submitPayment(PaymentSubmission submission) throws ExecutionException, InterruptedException {
        if (submission.getId() == null || submission.getId().isEmpty()) {
            submission.setId(UUID.randomUUID().toString());
        }
        submission.setStatus("PENDING");
        submission.setCreatedAt(System.currentTimeMillis());
        firestore.collection(COLLECTION_PAYMENTS).document(submission.getId()).set(submission).get();
        return submission;
    }

    public List<PaymentSubmission> getAllPending() throws ExecutionException, InterruptedException {
        List<QueryDocumentSnapshot> docs = firestore.collection(COLLECTION_PAYMENTS)
                .whereEqualTo("status", "PENDING")
                .get().get().getDocuments();
        List<PaymentSubmission> list = new ArrayList<>();
        for (QueryDocumentSnapshot doc : docs) {
            list.add(doc.toObject(PaymentSubmission.class));
        }
        return list;
    }

    public PaymentSubmission approvePayment(String paymentId, String adminUid) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection(COLLECTION_PAYMENTS).document(paymentId).get().get();
        if (!doc.exists()) return null;
        
        PaymentSubmission submission = doc.toObject(PaymentSubmission.class);
        if (!"PENDING".equals(submission.getStatus())) return submission;

        submission.setStatus("APPROVED");
        firestore.collection(COLLECTION_PAYMENTS).document(paymentId).set(submission).get();

        // FIFO Bill deduction logic (simplified)
        Double remainingAmount = submission.getAmount();
        List<QueryDocumentSnapshot> unpaidBillsDocs = firestore.collection(COLLECTION_BILLS)
                .whereEqualTo("memberUid", submission.getMemberUid())
                .whereEqualTo("status", "UNPAID")
                .get().get().getDocuments();

        for (QueryDocumentSnapshot billDoc : unpaidBillsDocs) {
            if (remainingAmount <= 0) break;
            Bill bill = billDoc.toObject(Bill.class);
            Double billRemaining = bill.getAmountDue(); // Simplified, assuming no partial payments in data model yet for brevity
            
            if (remainingAmount >= billRemaining) {
                bill.setStatus("PAID");
                bill.setPaidAt(System.currentTimeMillis());
                remainingAmount -= billRemaining;
            } else {
                // For partial, we need to track amountPaid, which requires adding amountPaid to Bill
                bill.setAmountDue(billRemaining - remainingAmount); 
                remainingAmount = 0.0;
            }
            firestore.collection(COLLECTION_BILLS).document(bill.getId()).set(bill).get();
        }

        // Create Income Transaction
        Transaction tx = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .type("INCOME")
                .amount(submission.getAmount())
                .description("Pembayaran iuran member disetujui")
                .timestamp(System.currentTimeMillis())
                .createdByUid(adminUid)
                .build();
        firestore.collection(COLLECTION_TRANSACTIONS).document(tx.getId()).set(tx);

        return submission;
    }

    public PaymentSubmission rejectPayment(String paymentId) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection(COLLECTION_PAYMENTS).document(paymentId).get().get();
        if (!doc.exists()) return null;
        
        PaymentSubmission submission = doc.toObject(PaymentSubmission.class);
        submission.setStatus("REJECTED");
        firestore.collection(COLLECTION_PAYMENTS).document(paymentId).set(submission).get();
        return submission;
    }
}
