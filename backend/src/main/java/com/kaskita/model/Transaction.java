package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    private String id;
    private String type; // INCOME or EXPENSE
    private Double amount;
    private String description;
    private Long timestamp;
    private String createdByUid;
}
