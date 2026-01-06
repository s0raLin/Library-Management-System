package com.cangli.service.impl;

import com.cangli.pojo.BookItem;

import java.util.List;

public interface BookItemServiceTrait {

    void addBookItem(BookItem bookItem);

    List<BookItem> findByBookId(Long id);

    List<BookItem> findByBookIdAndStatus(Long bookId, String status);

    void updateStatus(Integer id, String status);

    void batchUpdateStatus(String ids, String status);

    void batchInsert(List<BookItem> bookItems);
}
