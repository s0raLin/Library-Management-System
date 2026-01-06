package com.cangli.mapper;

import com.cangli.pojo.Reader;
import com.cangli.pojo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ReaderMapper {
    List<Reader> findAll();
    Reader findById(Long id);
    void addReader(Reader reader);
    void updateReader(Reader reader);
    void deleteReader(Long id);

    @Select("select username,password from reader where username=#{username} and password=#{password}")
    User findByUserNameAndPassword(String username, String password);

    @Select("select * from reader where username=#{username} and password=#{password}")
    Reader findReaderByUserNameAndPassword(String username, String password);
}
