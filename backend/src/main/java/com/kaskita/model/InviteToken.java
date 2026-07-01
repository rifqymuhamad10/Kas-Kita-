package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteToken {
    private String token;
    private Long createdAt;
    private boolean used;
    private String usedByUid;
}
