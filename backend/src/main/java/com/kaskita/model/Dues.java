package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dues {
    private String id;
    private String memberUid;
    private Double amount;
    private String status; // PAID or UNPAID
    private String monthPeriod; // format: "YYYY-MM"
    private Long paymentDate;
}
