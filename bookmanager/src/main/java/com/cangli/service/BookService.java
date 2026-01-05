package com.cangli.service;

import com.cangli.mapper.BookMapper;
import com.cangli.pojo.Book;
import com.cangli.pojo.Category;
import com.cangli.service.impl.BookServiceTrait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class BookService implements BookServiceTrait {

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private CategoryService categoryService; // 假设有类别服务

    public List<Book> findAll() {
        return bookMapper.findAll();
    }

    @Override
    @Transactional
    public void addBook(Book book) {
        // 1. 数据校验
        validateBookData(book);

        // 2. 生成图书代码
        String code = generateBookCode(book.getCategory());
        book.setCode(code);

        // 3. 设置默认值
        if (book.getBorrowTimes() == null) {
            book.setBorrowTimes(0);
        }
        if (book.getEntryDate() == null) {
            book.setEntryDate(new Date());
        }

        // 4. 插入数据库
        bookMapper.addBook(book);
    }

    @Transactional
    public void updateBook(Book book) {
        validateBookData(book);
        bookMapper.updateBook(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        bookMapper.softDeleteBook(id);
    }

    @Transactional
    public void purchaseBook(Long id, Integer quantity, String supplier) {
        Book book = bookMapper.findById(id);
        if (book == null) {
            throw new IllegalArgumentException("purchaseBook: 图书不存在");
        }
        book.setTotalQuantity(book.getTotalQuantity() + quantity);
        book.setStockQuantity(book.getStockQuantity() + quantity);
        bookMapper.updateBook(book);
    }

    @Transactional
    public void discardBook(Long id, Integer quantity) {
        Book book = bookMapper.findById(id);
        if (book == null) {
            throw new IllegalArgumentException("图书不存在");
        }
        if (book.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("库存不足");
        }
        book.setTotalQuantity(book.getTotalQuantity() - quantity);
        book.setStockQuantity(book.getStockQuantity() - quantity);
        bookMapper.updateBook(book);
    }

    /**
     * 校验图书数据
     */
    private void validateBookData(Book book) {
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("图书标题不能为空");
        }

        if (book.getAuthor() == null || book.getAuthor().trim().isEmpty()) {
            throw new IllegalArgumentException("图书作者不能为空");
        }

        if (book.getCategory() == null || book.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("图书分类不能为空");
        }

        if (book.getTotalQuantity() == null || book.getTotalQuantity() < 0) {
            throw new IllegalArgumentException("总数量必须大于等于0");
        }

        if (book.getStockQuantity() == null || book.getStockQuantity() < 0) {
            throw new IllegalArgumentException("库存数量必须大于等于0");
        }

        if (book.getStockQuantity() > book.getTotalQuantity()) {
            throw new IllegalArgumentException("库存数量不能超过总数量");
        }

        if (book.getPrice() != null && book.getPrice() < 0) {
            throw new IllegalArgumentException("价格不能为负数");
        }
    }

    /**
     * 根据分类生成图书代码
     */
    private String generateBookCode(String category) {
        // 从categories表中查找对应的code
        List<Category> categories = categoryService.findAll();
        String prefix = "QT"; // 默认分类代码
        for (Category cat : categories) {
            if (cat.getName().equals(category)) {
                prefix = cat.getCode();
                break;
            }
        }

        // 生成唯一ID（这里简化为使用时间戳，实际应该使用数据库自增ID或专门的序列）
        long timestamp = System.currentTimeMillis();
        String idStr = String.format("%04d", timestamp % 10000); // 取后4位

        return prefix + "-" + idStr;
    }
}