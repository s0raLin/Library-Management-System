// src/api/bookitem.ts
import { get, post, put, del } from '@/app/api/request';  // 引入封装的工具

export interface BookItem {
  id: number;
  bookId: number;
  barcode: string;
  location: string;
  status: string;
  priceAtEntry: number;
  entryDate: string;
  notes: string;
}

// 获取所有图书单例
export function getBookItemList(): Promise<BookItem[]> {
  return get('/bookitems');
}

// 获取单个图书单例
export function getBookItemById(id: number): Promise<BookItem> {
  return get(`/bookitems/${id}`);
}

// 添加图书单例
export function addBookItem(bookItem: Omit<BookItem, 'id'>): Promise<any> {
  return post('/bookitems', bookItem);
}

// 更新图书单例
export function updateBookItem(id: number, bookItem: Partial<BookItem>): Promise<any> {
  return put(`/bookitems/${id}`, bookItem);
}

// 删除图书单例
export function deleteBookItem(id: number): Promise<any> {
  return del(`/bookitems/${id}`);
}