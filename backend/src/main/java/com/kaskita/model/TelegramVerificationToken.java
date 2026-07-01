package com.kaskita.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelegramVerificationToken {
    private String token;
    private String userUid;
    private Long createdAt;
    private boolean used;
}
