package com.kaskita.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TargetRequest {
    private String name;
    private String description;
    private Double targetAmount;
    private String imageUrl;
    private Long deadline;
    private String priority; // HIGH, MEDIUM, LOW
}
