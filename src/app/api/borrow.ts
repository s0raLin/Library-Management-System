// src/api/borrow.ts
import { get, post, put } from '@/app/api/request';  // 引入封装的工具
import type { BorrowRecord } from '../components/BorrowManagement';

// 获取借阅记录列表
export function getBorrowList() {
  return get('/borrow');
}

// 借书
export function borrowBook(bookId: number, readerId: number): Promise<any> {
  return post('/borrow', { bookId, readerId });
}

// 还书
export function returnBook(recordId: number): Promise<any> {
  return put(`/borrow/${recordId}/return`);
}

// 续借
export function renewBook(recordId: number): Promise<any> {
  return put(`/borrow/${recordId}/renew`);
}
