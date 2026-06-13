package com.kaskita.controller;

import com.kaskita.model.Dues;
import com.kaskita.service.DuesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dues")
public class DuesController {

    private final DuesService duesService;

    public DuesController(DuesService duesService) {
        this.duesService = duesService;
    }

    @GetMapping("/{monthPeriod}")
    public ResponseEntity<List<Dues>> getDuesByMonth(@PathVariable String monthPeriod) {
        try {
            List<Dues> duesList = duesService.getDuesByMonth(monthPeriod);
            return ResponseEntity.ok(duesList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<String> recordPayment(@RequestBody Dues dues) {
        try {
            String updateTime = duesService.recordPayment(dues);
            return ResponseEntity.status(HttpStatus.CREATED).body("Dues recorded at: " + updateTime);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
