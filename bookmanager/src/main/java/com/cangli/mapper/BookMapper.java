package com.cangli.mapper;

import com.cangli.pojo.Book;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BookMapper {
    List<Book> findAll();
    Book findById(Long id);
    void addBook(Book book);
    void updateBook(Book book);
    void deleteBook(Long id);
}
