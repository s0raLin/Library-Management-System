package com.cangli.service.impl;

import com.cangli.pojo.Book;

import java.util.List;

public interface BookServiceTrait {
    List<Book> findAll();
    void addBook(Book book);
    void updateBook(Book book);
    void deleteBook(Long id);
    void purchaseBook(Long id, Integer quantity, String supplier);
    void discardBook(Long id, Integer quantity);
}
