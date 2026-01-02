package com.cangli.mapper;

import com.cangli.pojo.Reader;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ReaderMapper {
    List<Reader> findAll();
    Reader findById(Long id);
    void addReader(Reader reader);
    void updateReader(Reader reader);
    void deleteReader(Long id);
}
