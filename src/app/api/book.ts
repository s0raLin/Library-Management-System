// src/api/book.ts
import { get, post, put, del } from '@/app/api/request';  // 引入封装的工具
import type { Book } from '../components/BookManagement';

// 获取图书列表
export function getBookList() {
  console.log('getBookList called');
  return get('/book');
}

// 添加图书
export function addBook(bookData: Omit<Book, 'id' | 'code' | 'borrowTimes' | 'isDeleted'>): Promise<any> {
  return post('/book', bookData);
}

// 更新图书
export function updateBook(id: number, bookData: Partial<Book>): Promise<any> {
  return put(`/book/${id}`, bookData);
}

// 删除图书
export function deleteBook(id: number): Promise<any> {
  return del(`/book/${id}`);
}

// 采购图书（增加库存）
export function purchaseBook(id: number, quantity: number, supplier: string): Promise<any> {
  return put(`/book/purchase/${id}`, { quantity, supplier });
}

// 废弃图书（减少库存）
export function discardBook(id: number, quantity: number): Promise<any> {
  return put(`/book/discard/${id}`, { quantity });
}

