package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {
    private String id;
    private String memberUid;
    private String dueMasterId;
    private Double amountDue;
    private String status; // UNPAID, PENDING_APPROVAL, PAID
    private Long paidAt;
}
