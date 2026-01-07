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
  // Ensure we're sending the categoryId to the backend
  const { category, ...bookDataWithoutCategory } = bookData;
  const payload = {
    ...bookDataWithoutCategory,
    categoryId: bookData.categoryId
  };
  console.log('Sending book data to API:', payload);
  return post('/book', payload);
}

// 更新图书
export function updateBook(id: number, bookData: Partial<Book>): Promise<any> {
  return put(`/book/${id}`, bookData);
}

// 删除图书
export function deleteBook(id: number): Promise<any> {
  return del(`/book/${id}`);
}

// 入库图书（增加库存）
export function purchaseBook(bookId: number, quantity: number, supplier: string): Promise<any> {
  console.log('purchaseBook API called with:', { bookId, quantity, supplier });
  const payload = { 
    bookId: bookId,
    quantity: quantity, 
    supplier: supplier 
  };
  const url = `/bookitems/purchase`;
  console.log('Sending purchase request to:', url, payload);
  
  return post(url, payload)
    .then(response => {
      console.log('purchaseBook API response:', response);
      return response;
    })
    .catch(error => {
      console.error('purchaseBook API error:', error);
      throw error;
    });
}

// 废弃图书（减少库存）
export function discardBook(bookId: number, quantity: number): Promise<any> {
  console.log('discardBook API called with:', { bookId, quantity });
  const payload = {
    bookId: bookId,
    quantity: quantity
  };
  const url = `/bookitems/discard`;
  console.log('Sending discard request to:', url, payload);

  return put(url, payload)
    .then(response => {
      console.log('discardBook API response:', response);
      return response;
    })
    .catch(error => {
      console.error('discardBook API error:', error);
      throw error;
    });
}

// 更新单个图书单例状态
export function updateBookItemStatus(itemId: number, status: string): Promise<any> {
  console.log('updateBookItemStatus API called with:', { itemId, status });
  const payload = {
    status: status
  };
  const url = `/bookitems/status/${itemId}`;
  console.log('Sending update status request to:', url, payload);

  return put(url, payload)
    .then(response => {
      console.log('updateBookItemStatus API response:', response);
      return response;
    })
    .catch(error => {
      console.error('updateBookItemStatus API error:', error);
      throw error;
    });
}

