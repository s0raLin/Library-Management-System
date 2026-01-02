package com.cangli.mapper;

import com.cangli.pojo.BorrowRecord;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface BorrowRecordMapper {
    List<BorrowRecord> findAll();
    BorrowRecord findById(Long id);
    void addBorrowRecord(BorrowRecord record);
    void updateBorrowRecord(BorrowRecord record);
}
