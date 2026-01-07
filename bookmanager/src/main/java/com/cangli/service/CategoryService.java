package com.cangli.service;

import com.cangli.mapper.BookMapper;
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

    @Autowired
    private BookMapper bookMapper;

    @Override
    public List<Category> findAll() {
        return categoryMapper.findAll();
    }

    @Override
    public Category findById(Integer id) {
        return categoryMapper.findById(id);
    }

    @Override
    public Category findByCode(String code) {
        return categoryMapper.findByCode(code);
    }

    @Override
    public void addCategory(Category category) {
        // 记录传入的code
        String originalCode = category.getCode();
        System.out.println("添加分类: name=" + category.getName() + ", originalCode=" + originalCode);

        // 自动生成分类代码
        try {
            if (category.getCode() == null || category.getCode().trim().isEmpty()) {
                String generatedCode = generateCategoryCode(category.getName());
                System.out.println("自动生成code: " + generatedCode);
                category.setCode(generatedCode);
            } else {
                System.out.println("使用提供的code: " + category.getCode());
            }
        } catch (Exception e) {
            // 如果生成代码失败，使用默认代码
            category.setCode("DEFAULT");
            System.out.println("生成code失败，使用默认code: DEFAULT");
        }

        // 检查code是否已存在，如果存在则生成唯一code
        String baseCode = category.getCode();
        String uniqueCode = baseCode;
        int counter = 1;

        while (findByCode(uniqueCode) != null) {
            System.out.println("检测到重复code: " + uniqueCode + "，尝试生成新code");
            uniqueCode = baseCode + counter;
            counter++;
            if (counter > 100) { // 防止无限循环
                throw new RuntimeException("无法生成唯一的分类代码，请手动指定一个不同的代码");
            }
        }

        if (!uniqueCode.equals(baseCode)) {
            System.out.println("生成唯一code: " + uniqueCode + " (原code: " + baseCode + ")");
            category.setCode(uniqueCode);
        }

        System.out.println("准备插入分类: name=" + category.getName() + ", code=" + category.getCode());
        categoryMapper.addCategory(category);
        System.out.println("分类添加成功: ID=" + category.getId());
    }

    @Override
    public void updateCategory(Category category) {
        categoryMapper.updateCategory(category);
    }

    @Override
    public void deleteCategory(Integer id) {
        // 检查是否有图书属于该分类
        int bookCount = bookMapper.countByCategoryId(id);
        if (bookCount > 0) {
            throw new RuntimeException("无法删除分类：该分类下还有 " + bookCount + " 本图书。请先将这些图书移至其他分类或删除后再试。");
        }
        categoryMapper.deleteCategory(id);
    }
}