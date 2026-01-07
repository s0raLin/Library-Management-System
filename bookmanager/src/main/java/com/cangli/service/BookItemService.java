package com.cangli.service;

import com.cangli.mapper.BookItemMapper;
import com.cangli.pojo.BookItem;
import com.cangli.service.impl.BookItemServiceTrait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookItemService implements BookItemServiceTrait {

    @Autowired
    private BookItemMapper bookItemMapper;

    @Override
    public void addBookItem(BookItem bookItem) {
        bookItemMapper.addBookItem(bookItem);
    }

    @Override
    public List<BookItem> findByBookId(Long id) {
        return bookItemMapper.findByBookId(id);
    }

    @Override
    public List<BookItem> findByBookIdAndStatus(Long bookId, String status) {
        return bookItemMapper.findByBookIdAndStatus(bookId, status);
    }

    @Override
    public void updateStatus(Integer id, String status) {
        bookItemMapper.updateStatus(id, status);
    }

    @Override
    public void batchUpdateStatus(List<Integer> ids, String status) {
        bookItemMapper.batchUpdateStatus(ids, status);
    }

    @Override
    public void batchInsert(List<BookItem> bookItems) {
        if (bookItems != null && !bookItems.isEmpty()) {
            bookItemMapper.batchInsert(bookItems);
        }
    }

    @Override
    public BookItem findById(Integer id) {
        return bookItemMapper.findById(id);
    }

    @Override
    public void softDeleteByBookId(Long bookId) {
        bookItemMapper.softDeleteByBookId(bookId);
    }

    @Override
    public List<BookItem> findAll() {
        return bookItemMapper.findAll();
    }

    @Override
    public void updateBookItem(BookItem bookItem) {
        bookItemMapper.updateBookItem(bookItem);
    }

    @Override
    public void deleteBookItem(Integer id) {
        bookItemMapper.deleteBookItem(id);
    }

}
