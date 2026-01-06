package com.cangli.service.impl;

import com.cangli.pojo.Reader;
import com.cangli.pojo.User;

import java.util.List;

public interface ReaderServiceTrait {
    List<Reader> findAll();
    void addReader(Reader reader);
    void updateReader(Reader reader);
    void deleteReader(Long id);

    User findByUserNameAndPassword(String username, String password);
}
