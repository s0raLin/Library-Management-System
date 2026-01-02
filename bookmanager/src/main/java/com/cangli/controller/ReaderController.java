package com.cangli.controller;

import com.cangli.pojo.Reader;
import com.cangli.pojo.Result;
import com.cangli.service.ReaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/reader")
@RestController
public class ReaderController {
    @Autowired
    private ReaderService readerService;

    @GetMapping()
    Result getReaderList() {
        List<Reader> readers = readerService.findAll();
        return Result.ok(readers);
    }

    @PostMapping()
    Result addReader(@RequestBody Reader reader) {
        readerService.addReader(reader);
        return Result.ok(reader);
    }

    @PutMapping("/{id}")
    Result updateReader(@PathVariable Long id, @RequestBody Reader reader) {
        reader.setId(id);
        readerService.updateReader(reader);
        return Result.ok(reader);
    }

    @DeleteMapping("/{id}")
    Result deleteReader(@PathVariable Long id) {
        readerService.deleteReader(id);
        return Result.ok();
    }
}
