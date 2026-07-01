package com.kaskita.controller;

import com.kaskita.model.PaymentSubmission;
import com.kaskita.service.PaymentSubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/payments")
public class PaymentSubmissionController {
    private final PaymentSubmissionService paymentService;

    public PaymentSubmissionController(PaymentSubmissionService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/submit")
    public ResponseEntity<PaymentSubmission> submitPayment(@RequestBody PaymentSubmission submission) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(paymentService.submitPayment(submission));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PaymentSubmission>> getPendingPayments() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(paymentService.getAllPending());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PaymentSubmission> approvePayment(@PathVariable String id, @RequestParam String adminUid) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(paymentService.approvePayment(id, adminUid));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PaymentSubmission> rejectPayment(@PathVariable String id) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(paymentService.rejectPayment(id));
    }
}
