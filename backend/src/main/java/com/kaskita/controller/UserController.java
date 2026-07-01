package com.kaskita.controller;

import com.kaskita.model.Bill;
import com.kaskita.model.User;
import com.kaskita.service.BillService;
import com.kaskita.service.TelegramBotService;
import com.kaskita.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final TelegramBotService telegramBotService;
    private final BillService billService;

    public UserController(UserService userService, TelegramBotService telegramBotService, BillService billService) {
        this.userService = userService;
        this.telegramBotService = telegramBotService;
        this.billService = billService;
    }

    @GetMapping("/members")
    public ResponseEntity<List<User>> getAllMembers() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(userService.getAllMembers());
    }

    @PostMapping("/{uid}/invite")
    public ResponseEntity<User> inviteUser(@PathVariable String uid) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(userService.inviteUser(uid));
    }

    @PostMapping("/{uid}/send-reminder")
    public ResponseEntity<?> sendReminder(@PathVariable String uid) throws ExecutionException, InterruptedException {
        User user = userService.getUserByUid(uid);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "User tidak ditemukan"));
        }

        if (!user.isTelegramLinked() || user.getTelegramChatId() == null) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Telegram siswa belum terhubung"));
        }

        // Hitung total tagihan belum lunas (UNPAID)
        List<Bill> bills = billService.getBillsByMemberUid(uid);
        double arrears = bills.stream()
                .filter(b -> "UNPAID".equals(b.getStatus()))
                .mapToDouble(b -> b.getAmountDue() != null ? b.getAmountDue() : 0.0)
                .sum();

        if (arrears <= 0) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Siswa tidak memiliki tagihan unpaid"));
        }

        String formattedAmount = String.format("%,.0f", arrears).replace(',', '.');
        String message = String.format(
                "Halo %s, ini adalah pengingat dari Bendahara Kas Kita. 🔔\n\n" +
                "Anda memiliki tagihan uang kas yang belum dibayar sebesar *Rp %s*.\n" +
                "Silakan segera lakukan pembayaran melalui dashboard aplikasi Kas Kita.\n\n" +
                "Terima kasih atas kerjasamanya! 🙏",
                user.getName(),
                formattedAmount
        );

        boolean sent = telegramBotService.sendReminder(user.getTelegramChatId(), message);
        if (sent) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Pengingat Telegram berhasil dikirim"));
        } else {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Gagal mengirim pesan melalui Telegram"));
        }
    }
}

