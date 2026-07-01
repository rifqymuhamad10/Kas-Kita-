package com.kaskita.controller;

import com.kaskita.model.InviteToken;
import com.kaskita.service.InviteTokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/tokens")
public class InviteTokenController {

    private final InviteTokenService inviteTokenService;

    public InviteTokenController(InviteTokenService inviteTokenService) {
        this.inviteTokenService = inviteTokenService;
    }

    @PostMapping("/generate")
    public ResponseEntity<InviteToken> generateToken() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(inviteTokenService.generateToken());
    }

    @PostMapping("/redeem")
    public ResponseEntity<Map<String, Object>> redeemToken(@RequestBody Map<String, String> body)
            throws ExecutionException, InterruptedException {
        String token = body.get("token");
        String memberUid = body.get("memberUid");

        if (token == null || memberUid == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token dan memberUid wajib diisi"
            ));
        }

        boolean success = inviteTokenService.redeemToken(token.trim().toUpperCase(), memberUid);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Token berhasil digunakan! Akses telah diberikan."
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token tidak valid atau sudah pernah digunakan."
            ));
        }
    }
}