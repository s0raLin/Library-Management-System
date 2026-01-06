package com.cangli.mapper;

import com.cangli.pojo.BookItem;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
@Mapper
public interface BookItemMapper {

    List<BookItem> findByBookId(Long id);

    List<BookItem> findByBookIdAndStatus(Long bookId, String status);

    void updateStatus(Integer id, String status);

    void batchUpdateStatus(String ids, String status);

    void addBookItem(BookItem bookItem);

    void batchInsert(List<BookItem> bookItems);
}
