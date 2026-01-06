package com.cangli.controller;

import com.cangli.pojo.Book;
import com.cangli.pojo.Result;
import com.cangli.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/book")
@RestController
public class BookController {
    @Autowired
    private BookService bookService;

    @GetMapping()
    Result getBookList() {
        List<Book> books = bookService.findAll();
        return Result.ok(books);
    }

    @PostMapping()
    Result addBook(@RequestBody Book book) {
        System.out.println(book);
        bookService.addBook(book);
        return Result.ok(book);
    }

    @PutMapping("/{id}")
    Result updateBook(@PathVariable Long id, @RequestBody Book book) {
        book.setId(id);
        bookService.updateBook(book);
        return Result.ok(book);
    }

    @DeleteMapping("/{id}")
    Result deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return Result.ok();
    }

    @PutMapping("/purchase/{id}")
    Result purchaseBook(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Integer quantity = (Integer) request.get("quantity");
        String supplier = (String) request.get("supplier");

        System.out.println("订阅:");
        System.out.println(quantity);
        System.out.println(supplier);
        System.out.println("订阅成功");
        bookService.purchaseBook(id, quantity, supplier);
        return Result.ok();
    }

    @PutMapping("/discard/{id}")
    Result discardBook(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Integer quantity = (Integer) request.get("quantity");
        bookService.discardBook(id, quantity);
        return Result.ok();
    }
}
