package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Target {
    private String id;
    private String name;
    private String description;
    private Double targetAmount;
    private String imageUrl;
    private Long deadline;
    private String priority;   // HIGH, MEDIUM, LOW
    private String status;     // ACTIVE, ACHIEVED, CANCELLED
    private String createdByUid;
    private Long createdAt;
}
