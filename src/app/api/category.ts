// src/api/category.ts
import { get, post, put, del } from '@/app/api/request';  // 引入封装的工具

type Category = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

// 获取类别列表
export function getCategoryList(): Promise<any> {
  return get('/categories');
}

// 获取单个类别
export function getCategory(id: number): Promise<any> {
  return get(`/categories/${id}`);
}

// 添加类别
export function addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
  return post('/categories', category);
}

// 更新类别
export function updateCategory(id: number, category: Partial<Category>): Promise<any> {
  return put(`/categories/${id}`, category);
}

// 删除类别
export function deleteCategory(id: number): Promise<any> {
  return del(`/categories/${id}`);
}

// 获取类别映射（向后兼容）
export function getCategoryMap(): Promise<Category[]> {
  return getCategoryList();
}