package com.cangli.controller;

import com.cangli.pojo.Result;
import com.cangli.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/bookitems")
@RestController
public class BookItemController {

    @Autowired
    private BookService bookService;

    @PostMapping("/purchase")
    Result purchaseBook(@RequestBody Map<String, Object> request) {
        Long bookId = Long.valueOf(request.get("bookId").toString());
        Integer quantity = (Integer) request.get("quantity");
        String supplier = (String) request.get("supplier");

        bookService.purchaseBook(bookId, quantity, supplier);
        return Result.ok();
    }

    @PutMapping("/discard")
    Result discardBook(@RequestBody Map<String, Object> request) {
        Long bookId = Long.valueOf(request.get("bookId").toString());
        Integer quantity = (Integer) request.get("quantity");

        bookService.discardBook(bookId, quantity);
        return Result.ok();
    }

    @PutMapping("/status/{itemId}")
    Result updateBookItemStatus(@PathVariable Integer itemId, @RequestBody Map<String, Object> request) {
        String status = (String) request.get("status");
        bookService.updateBookItemStatus(itemId, status);
        return Result.ok();
    }
}