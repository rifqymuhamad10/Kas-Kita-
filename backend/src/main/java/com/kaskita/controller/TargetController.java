package com.kaskita.controller;

import com.kaskita.model.Target;
import com.kaskita.model.dto.TargetRequest;
import com.kaskita.service.TargetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/v1/targets")
public class TargetController {

    private final TargetService targetService;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    public TargetController(TargetService targetService) {
        this.targetService = targetService;
    }

    @GetMapping
    public ResponseEntity<List<Target>> getAllTargets() {
        try {
            List<Target> targets = targetService.getAllTargets();
            return ResponseEntity.ok(targets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<Target>> getActiveTargets() {
        try {
            List<Target> targets = targetService.getActiveTargets();
            return ResponseEntity.ok(targets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Target> getTargetById(@PathVariable String id) {
        try {
            Target target = targetService.getTargetById(id);
            if (target == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(target);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> createTarget(@RequestBody TargetRequest request,
                                                Authentication authentication) {
        try {
            String targetId = java.util.UUID.randomUUID().toString();
            String imageUrl = request.getImageUrl();
            if (imageUrl != null && imageUrl.startsWith("data:image/")) {
                imageUrl = saveTargetImage(targetId, imageUrl);
            }

            Target target = Target.builder()
                    .id(targetId)
                    .name(request.getName())
                    .description(request.getDescription())
                    .targetAmount(request.getTargetAmount())
                    .imageUrl(imageUrl)
                    .deadline(request.getDeadline())
                    .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                    .status("ACTIVE")
                    .createdByUid(authentication.getName())
                    .createdAt(System.currentTimeMillis())
                    .build();

            String result = targetService.createTarget(target);
            return ResponseEntity.status(HttpStatus.CREATED).body("Target saved at: " + result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> updateTarget(@PathVariable String id,
                                                @RequestBody TargetRequest request) {
        try {
            Target existing = targetService.getTargetById(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            String imageUrl = request.getImageUrl();
            if (imageUrl != null && imageUrl.startsWith("data:image/")) {
                imageUrl = saveTargetImage(id, imageUrl);
            }

            existing.setName(request.getName() != null ? request.getName() : existing.getName());
            existing.setDescription(request.getDescription() != null ? request.getDescription() : existing.getDescription());
            existing.setTargetAmount(request.getTargetAmount() != null ? request.getTargetAmount() : existing.getTargetAmount());
            if (imageUrl != null) {
                existing.setImageUrl(imageUrl);
            }
            existing.setDeadline(request.getDeadline() != null ? request.getDeadline() : existing.getDeadline());
            existing.setPriority(request.getPriority() != null ? request.getPriority() : existing.getPriority());

            String result = targetService.updateTarget(id, existing);
            return ResponseEntity.ok("Target updated at: " + result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> updateTargetStatus(@PathVariable String id,
                                                      @RequestBody java.util.Map<String, String> body) {
        try {
            Target existing = targetService.getTargetById(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            String newStatus = body.get("status");
            if (newStatus == null || (!newStatus.equals("ACTIVE") && !newStatus.equals("ACHIEVED") && !newStatus.equals("CANCELLED"))) {
                return ResponseEntity.badRequest().body("Invalid status. Must be ACTIVE, ACHIEVED, or CANCELLED.");
            }

            existing.setStatus(newStatus);
            String result = targetService.updateTarget(id, existing);
            return ResponseEntity.ok("Target status updated at: " + result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> deleteTarget(@PathVariable String id) {
        try {
            Target existing = targetService.getTargetById(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            String result = targetService.deleteTarget(id);
            return ResponseEntity.ok("Target deleted at: " + result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    private String saveTargetImage(String targetId, String base64Image) throws Exception {
        String[] parts = base64Image.split(",");
        String header = parts[0];
        String base64Data = parts[1];

        String extension = "jpg";
        if (header.contains("image/png")) {
            extension = "png";
        } else if (header.contains("image/webp")) {
            extension = "webp";
        } else if (header.contains("image/gif")) {
            extension = "gif";
        }

        byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);

        java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads");
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }

        String filename = "target-" + targetId + "." + extension;
        java.nio.file.Path filePath = uploadPath.resolve(filename);
        java.nio.file.Files.write(filePath, imageBytes);

        return backendUrl + "/uploads/" + filename;
    }
}
