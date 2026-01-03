package com.cangli.service.impl;

import com.cangli.pojo.BorrowRecord;

import java.util.List;

public interface BorrowRecordTrait {
    List<BorrowRecord> findAll();
    BorrowRecord borrowBook(Long bookId, Long readerId);
    BorrowRecord returnBook(Long recordId);
    BorrowRecord renewBook(Long recordId);
}
