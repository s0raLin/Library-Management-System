package com.cangli.service;

import com.cangli.mapper.BookMapper;
import com.cangli.mapper.BorrowRecordMapper;
import com.cangli.mapper.ReaderMapper;
import com.cangli.pojo.Book;
import com.cangli.pojo.BorrowRecord;
import com.cangli.pojo.Reader;
import com.cangli.service.impl.BorrowRecordTrait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service
public class BorrowRecordService implements BorrowRecordTrait {
    @Autowired
    private BorrowRecordMapper borrowRecordMapper;

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private ReaderMapper readerMapper;

    @Override
    public List<BorrowRecord> findAll() {
        List<BorrowRecord> records = borrowRecordMapper.findAll();
        System.out.println("BorrowRecordService.findAll() returned " + records.size() + " records");
        return records;
    }

    @Transactional
    public BorrowRecord borrowBook(Long bookId, Long readerId) {
        // 检查图书是否存在且有库存
        Book book = bookMapper.findById(bookId);
        if (book == null) {
            throw new IllegalArgumentException("图书不存在");
        }
        if (book.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("图书库存不足");
        }

        // 检查读者是否存在
        Reader reader = readerMapper.findById(readerId);
        if (reader == null) {
            throw new IllegalArgumentException("读者不存在");
        }

        // 创建借阅记录
        BorrowRecord record = new BorrowRecord();
        record.setBookId(bookId);
        record.setReaderId(readerId);
        record.setBorrowDate(new Date());

        // 设置应还日期（30天后）
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, 30);
        record.setDueDate(cal.getTime());

        record.setStatus("借出");

        // 设置冗余的图书信息
        record.setBookTitle(book.getTitle());
        record.setBookAuthor(book.getAuthor());
        record.setBookIsbn(book.getIsbn());
        record.setBookPublisher(book.getPublisher());
        record.setBookCategory(book.getCategory());

        // 插入借阅记录
        borrowRecordMapper.addBorrowRecord(record);

        // 更新图书库存和借阅次数
        book.setStockQuantity(book.getStockQuantity() - 1);
        book.setBorrowTimes(book.getBorrowTimes() + 1);
        bookMapper.updateBook(book);

        // 更新读者借书数量
        reader.setBorrowedCount(reader.getBorrowedCount() + 1);
        readerMapper.updateReader(reader);

        return record;
    }

    @Transactional
    public BorrowRecord returnBook(Long recordId) {
        BorrowRecord record = borrowRecordMapper.findById(recordId);
        if (record == null) {
            throw new IllegalArgumentException("借阅记录不存在");
        }
        if (!"借出".equals(record.getStatus())) {
            throw new IllegalArgumentException("该记录已归还");
        }

        // 更新借阅记录
        record.setReturnDate(new Date());
        record.setStatus("已还");
        borrowRecordMapper.updateBorrowRecord(record);

        // 更新图书库存
        Book book = bookMapper.findById(record.getBookId());
        if (book != null) {
            book.setStockQuantity(book.getStockQuantity() + 1);
            bookMapper.updateBook(book);
        }

        // 更新读者借书数量
        Reader reader = readerMapper.findById(record.getReaderId());
        if (reader != null && reader.getBorrowedCount() > 0) {
            reader.setBorrowedCount(reader.getBorrowedCount() - 1);
            readerMapper.updateReader(reader);
        }

        return record;
    }

    @Transactional
    public BorrowRecord renewBook(Long recordId) {
        BorrowRecord record = borrowRecordMapper.findById(recordId);
        if (record == null) {
            throw new IllegalArgumentException("借阅记录不存在");
        }
        if (!"借出".equals(record.getStatus())) {
            throw new IllegalArgumentException("该记录无法续借");
        }

        // 延长应还日期（30天）
        Calendar cal = Calendar.getInstance();
        cal.setTime(record.getDueDate());
        cal.add(Calendar.DAY_OF_MONTH, 30);
        record.setDueDate(cal.getTime());

        borrowRecordMapper.updateBorrowRecord(record);
        return record;
    }
}
