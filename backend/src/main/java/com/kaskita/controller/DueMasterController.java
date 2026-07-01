package com.kaskita.controller;

import com.kaskita.model.DueMaster;
import com.kaskita.service.DueMasterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/duemasters")
public class DueMasterController {
    private final DueMasterService dueMasterService;

    public DueMasterController(DueMasterService dueMasterService) {
        this.dueMasterService = dueMasterService;
    }

    @PostMapping
    public ResponseEntity<DueMaster> createDueMaster(@RequestBody DueMaster dueMaster) throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(dueMasterService.createDueMaster(dueMaster));
    }

    @GetMapping
    public ResponseEntity<List<DueMaster>> getAllDueMasters() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(dueMasterService.getAllDueMasters());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDueMaster(@PathVariable String id) throws ExecutionException, InterruptedException {
        dueMasterService.deleteDueMaster(id);
        return ResponseEntity.ok().build();
    }
}
