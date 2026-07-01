package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueMaster {
    private String id;
    private String adminUid;
    private String title;
    private Double amount;
    private Long createdAt;
}
