package com.cangli.service.impl;

import com.cangli.pojo.BookItem;

import java.util.List;

public interface BookItemServiceTrait {

    void addBookItem(BookItem bookItem);

    List<BookItem> findByBookId(Long id);

    List<BookItem> findByBookIdAndStatus(Long bookId, String status);

    void updateStatus(Integer id, String status);

    void batchUpdateStatus(List<Integer> ids, String status);

    void batchInsert(List<BookItem> bookItems);

    BookItem findById(Integer id);

    void softDeleteByBookId(Long bookId);

    // CRUD operations for individual BookItems
    List<BookItem> findAll();

    void updateBookItem(BookItem bookItem);

    void deleteBookItem(Integer id);
}
