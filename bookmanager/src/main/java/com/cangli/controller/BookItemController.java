package com.cangli.controller;

import com.cangli.pojo.BookItem;
import com.cangli.pojo.Result;
import com.cangli.service.BookItemService;
import com.cangli.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/bookitems")
@RestController
public class BookItemController {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookItemService bookItemService;

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

    // CRUD operations for individual BookItems
    @GetMapping
    Result getAllBookItems() {
        List<BookItem> bookItems = bookItemService.findAll();
        return Result.ok(bookItems);
    }

    @GetMapping("/{id}")
    Result getBookItemById(@PathVariable Integer id) {
        BookItem bookItem = bookItemService.findById(id);
        if (bookItem != null) {
            return Result.ok(bookItem);
        } else {
            return Result.error("BookItem not found");
        }
    }

    @PostMapping
    Result createBookItem(@RequestBody BookItem bookItem) {
        bookItemService.addBookItem(bookItem);
        return Result.ok();
    }

    @PutMapping("/{id}")
    Result updateBookItem(@PathVariable Integer id, @RequestBody BookItem bookItem) {
        bookItem.setId(id);
        bookItemService.updateBookItem(bookItem);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    Result deleteBookItem(@PathVariable Integer id) {
        bookItemService.deleteBookItem(id);
        return Result.ok();
    }
}