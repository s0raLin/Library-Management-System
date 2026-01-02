// src/api/category.ts
import { get } from '@/app/api/request';  // 引入封装的工具

// 获取类别映射
export function getCategoryMap() {
  return get('/categories');
}