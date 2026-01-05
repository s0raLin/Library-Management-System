package com.cangli.service;

import com.cangli.mapper.CategoryMapper;
import com.cangli.pojo.Category;
import com.cangli.service.impl.CategoryServiceTrait;
import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.HanyuPinyinOutputFormat;
import net.sourceforge.pinyin4j.format.HanyuPinyinToneType;
import net.sourceforge.pinyin4j.format.exception.BadHanyuPinyinOutputFormatCombination;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CategoryService implements CategoryServiceTrait {

    /**
     * 根据分类名称获取分类代码
     */
    // 在 CategoryService 中添加方法
    public String generateCategoryCode(String chineseName) throws BadHanyuPinyinOutputFormatCombination {
        StringBuilder code = new StringBuilder();
        HanyuPinyinOutputFormat format = new HanyuPinyinOutputFormat();
        format.setToneType(HanyuPinyinToneType.WITHOUT_TONE);

        for (char c : chineseName.toCharArray()) {
            if (Character.toString(c).matches("[\\u4E00-\\u9FA5]")) { // 中文字符
                String[] pinyinArray = PinyinHelper.toHanyuPinyinStringArray(c, format);
                if (pinyinArray != null && pinyinArray.length > 0) {
                    code.append(pinyinArray[0].charAt(0)); // 取首字母
                }
            }
        }

        return code.toString().toUpperCase();
    }

    @Autowired
    private CategoryMapper categoryMapper;

    @Override
    public List<Category> findAll() {
        return categoryMapper.findAll();
    }
}