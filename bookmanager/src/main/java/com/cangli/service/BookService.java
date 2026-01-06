package com.cangli.service;

import com.cangli.mapper.BookItemMapper;
import com.cangli.mapper.BookMapper;
import com.cangli.pojo.Book;
import com.cangli.pojo.BookItem;
import com.cangli.pojo.Category;
import com.cangli.service.impl.BookServiceTrait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class BookService implements BookServiceTrait {

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private BookItemService bookItemService;

    @Autowired
    private CategoryService categoryService; // 假设有类别服务

    public List<Book> findAll() {

        List<Book> books = bookMapper.findAll();
        for (Book book : books) {
            List<BookItem> findItems = bookItemService.findByBookId(book.getId());
            book.setBookItems(findItems);
        }
        return books;

    }

    @Override
    @Transactional
    public void addBook(Book book) {
        // 1. 数据校验

        // 2. 生成图书代码
        Category category = categoryService.findById(book.getCategoryId());

        String prefix = generateBookCode(category.getCode());
        // 生成唯一ID
        long timestamp = System.currentTimeMillis();
        String idStr = String.format("%04d", timestamp % 10000);
        book.setCode(prefix + idStr);

        // 3. 设置默认值
        if (book.getBorrowTimes() == null) {
            book.setBorrowTimes(0);
        }
        if (book.getEntryDate() == null) {
            book.setEntryDate(new Date());
        }

        // 4. 插入数据库（不插入BookItems，因为添加图书时没有库存）
        bookMapper.addBook(book);
    }

    @Transactional
    public void updateBook(Book book) {
        bookMapper.updateBook(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        // 检查是否有BookItems
        List<BookItem> bookItems = bookItemService.findByBookId(id);
        if (bookItems != null && !bookItems.isEmpty()) {
            throw new IllegalArgumentException("deleteBook: 无法删除图书，因为该图书还有库存副本");
        }

        // 没有BookItems，可以安全删除
        bookMapper.softDeleteBook(id);
    }

    @Transactional
    public void purchaseBook(Long id, Integer quantity, String supplier) {
        Book book = bookMapper.findById(id);
        if (book == null) {
            throw new IllegalArgumentException("purchaseBook: 图书不存在");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("purchaseBook: 采购数量必须大于0");
        }

        // 生成指定数量的BookItems
        List<BookItem> newBookItems = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            BookItem bookItem = new BookItem();
            bookItem.setBookId(id.intValue());
            bookItem.setBarcode(generateBarcode(id, i));
            bookItem.setLocation("默认位置"); // 可以后续修改
            bookItem.setStatus("available");
            bookItem.setPriceAtEntry(book.getPrice());
            bookItem.setEntryDate(new Date());
            bookItem.setNotes("采购自: " + (supplier != null ? supplier : "未知供应商"));
            newBookItems.add(bookItem);
        }

        // 批量插入BookItems
        bookItemService.batchInsert(newBookItems);
    }

    @Transactional
    public void discardBook(Long id, Integer quantity) {
        Book book = bookMapper.findById(id);
        if (book == null) {
            throw new IllegalArgumentException("discardBook: 图书不存在");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("discardBook: 丢弃数量必须大于0");
        }

        // 获取可用的BookItems
        List<BookItem> availableItems = bookItemService.findByBookIdAndStatus(id, "available");
        if (availableItems.size() < quantity) {
            throw new IllegalArgumentException("discardBook: 可用图书数量不足，无法丢弃 " + quantity + " 本");
        }

        // 选择前quantity个BookItems进行丢弃
        StringBuilder idsToUpdate = new StringBuilder();
        for (int i = 0; i < quantity; i++) {
            if (i > 0) idsToUpdate.append(",");
            idsToUpdate.append(availableItems.get(i).getId());
        }

        // 批量更新状态为damaged（丢弃的书视为损坏）
        bookItemService.batchUpdateStatus(idsToUpdate.toString(), "damaged");
    }

    @Transactional
    public void updateBookItemStatus(Integer itemId, String status) {
        bookItemService.updateStatus(itemId, status);
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

    /**
     * 生成图书条形码
     */
    private String generateBarcode(Long bookId, int sequence) {
        long timestamp = System.currentTimeMillis();
        return String.format("BK%06d%03d%02d", bookId, timestamp % 1000, sequence % 100);
    }
}