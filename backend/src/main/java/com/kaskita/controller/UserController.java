package com.kaskita.controller;

import com.kaskita.model.User;
import com.kaskita.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/members")
    public ResponseEntity<List<User>> getAllMembers() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(userService.getAllMembers());
    }

    @PostMapping("/{uid}/invite")
    public ResponseEntity<User> inviteUser(@PathVariable String uid) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(userService.inviteUser(uid));
    }
}
