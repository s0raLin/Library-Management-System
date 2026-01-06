package com.cangli.service;

import com.cangli.mapper.ReaderMapper;
import com.cangli.pojo.Reader;
import com.cangli.pojo.User;
import com.cangli.service.impl.ReaderServiceTrait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReaderService implements ReaderServiceTrait {
    @Autowired
    private ReaderMapper readerMapper;

    @Override
    public List<Reader> findAll() {
        return readerMapper.findAll();
    }

    @Transactional
    public void addReader(Reader reader) {
        validateReaderData(reader);
        if (reader.getBorrowedCount() == null) {
            reader.setBorrowedCount(0);
        }
        readerMapper.addReader(reader);
    }

    @Transactional
    public void updateReader(Reader reader) {
        validateReaderData(reader);
        readerMapper.updateReader(reader);
    }

    @Transactional
    public void deleteReader(Long id) {
        readerMapper.deleteReader(id);
    }

    @Override
    public User findByUserNameAndPassword(String username, String password) {
        return readerMapper.findByUserNameAndPassword(username, password);
    }

    public Reader findReaderByUserNameAndPassword(String username, String password) {

        return readerMapper.findReaderByUserNameAndPassword(username, password);
    }

    private void validateReaderData(Reader reader) {
        if (reader.getName() == null || reader.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("读者姓名不能为空");
        }
        if (reader.getGender() == null || reader.getGender().trim().isEmpty()) {
            throw new IllegalArgumentException("读者性别不能为空");
        }
    }
}
