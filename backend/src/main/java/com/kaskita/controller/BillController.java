package com.kaskita.controller;

import com.kaskita.model.Bill;
import com.kaskita.service.BillService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/bills")
public class BillController {
    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping("/member/{uid}")
    public ResponseEntity<List<Bill>> getBillsByMember(@PathVariable String uid) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(billService.getBillsByMemberUid(uid));
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(billService.getAllBills());
    }
}
