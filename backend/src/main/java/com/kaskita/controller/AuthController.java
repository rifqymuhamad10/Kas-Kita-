package com.kaskita.controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.kaskita.model.User;
import com.kaskita.model.dto.RegisterRequest;
import com.kaskita.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User newUser = userService.registerUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        // Filter dilewati untuk /me, jadi kita verifikasi token Firebase secara manual
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token tidak ditemukan. Silakan login terlebih dahulu.");
        }

        String token = authHeader.substring(7);
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            if (!decodedToken.isEmailVerified()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Email Anda belum diverifikasi. Silakan verifikasi email Anda terlebih dahulu.");
            }
            String uid = decodedToken.getUid();

            User user = userService.getUserByUid(uid);
            if (user == null) {
                // User Firebase Auth ada tapi belum ada di Firestore → auto-register dengan data dari token
                String nameFromToken = decodedToken.getName();
                String emailFromToken = decodedToken.getEmail();
                if (nameFromToken == null || nameFromToken.isEmpty()) {
                    nameFromToken = emailFromToken != null ? emailFromToken.split("@")[0] : "User";
                }

                RegisterRequest autoRegisterReq = new RegisterRequest();
                autoRegisterReq.setUid(uid);
                autoRegisterReq.setName(nameFromToken);
                autoRegisterReq.setEmail(emailFromToken);
                autoRegisterReq.setRole("ROLE_MEMBER"); // Default role

                user = userService.registerUser(autoRegisterReq);
            }
            if (!user.isActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Akun Anda tidak aktif. Hubungi administrator.");
            }

            // Standardisasi role
            String role = user.getRole();
            if (role == null || role.isEmpty()) {
                role = "ROLE_MEMBER";
            } else if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role.toUpperCase();
            }
            user.setRole(role);

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token tidak valid: " + e.getMessage());
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(HttpServletRequest request, @RequestBody com.kaskita.model.dto.ProfileUpdateRequest updateRequest) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token tidak ditemukan. Silakan login terlebih dahulu.");
        }

        String token = authHeader.substring(7);
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            String uid = decodedToken.getUid();

            User user = userService.getUserByUid(uid);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User tidak ditemukan.");
            }

            // Save image locally if photoUrl is a base64 string
            String photoUrl = updateRequest.getPhotoUrl();
            if (photoUrl != null && photoUrl.startsWith("data:image/")) {
                photoUrl = saveProfileImage(uid, photoUrl);
            }

            // Update user details
            user.setName(updateRequest.getName());
            if (photoUrl != null) {
                user.setPhotoUrl(photoUrl);
            }

            userService.updateUser(user);

            // Standardize role for the response
            String role = user.getRole();
            if (role == null || role.isEmpty()) {
                role = "ROLE_MEMBER";
            } else if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role.toUpperCase();
            }
            user.setRole(role);

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Gagal memperbarui profil: " + e.getMessage());
        }
    }

    private String saveProfileImage(String uid, String base64Image) throws Exception {
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

        String filename = "profile-" + uid + "." + extension;
        java.nio.file.Path filePath = uploadPath.resolve(filename);
        java.nio.file.Files.write(filePath, imageBytes);

        return "http://localhost:8080/uploads/" + filename;
    }
}

