package com.cangli.controller;

import com.cangli.pojo.BorrowRecord;
import com.cangli.pojo.Result;
import com.cangli.service.BorrowRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/borrow")
@RestController
public class BorrowRecordController {
    @Autowired
    private BorrowRecordService borrowRecordService;

    @GetMapping()
    Result getBorrowList() {
        List<BorrowRecord> borrowRecords = borrowRecordService.findAll();
        System.out.println("BorrowRecordController.getBorrowList() returning " + borrowRecords.size() + " records");
        for (BorrowRecord record : borrowRecords) {
            System.out.println("BorrowRecord: id=" + record.getId() + ", status=" + record.getStatus() + ", readerId=" + record.getReaderId());
        }
        return Result.ok(borrowRecords);
    }

    @PostMapping()
    Result borrowBook(@RequestBody Map<String, Object> request) {
        Long bookId = Long.valueOf(request.get("bookId").toString());
        Long readerId = Long.valueOf(request.get("readerId").toString());
        BorrowRecord record = borrowRecordService.borrowBook(bookId, readerId);
        return Result.ok(record);
    }

    @PutMapping("/{recordId}/return")
    Result returnBook(@PathVariable Long recordId) {
        BorrowRecord record = borrowRecordService.returnBook(recordId);
        return Result.ok(record);
    }

    @PutMapping("/{recordId}/renew")
    Result renewBook(@PathVariable Long recordId) {
        BorrowRecord record = borrowRecordService.renewBook(recordId);
        return Result.ok(record);
    }
}
