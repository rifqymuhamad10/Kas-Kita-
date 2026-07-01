package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSubmission {
    private String id;
    private String memberUid;
    private Double amount;
    private String status; // PENDING, APPROVED, REJECTED
    private Long createdAt;
}
