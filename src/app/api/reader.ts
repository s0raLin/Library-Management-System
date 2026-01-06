// src/api/reader.ts
import { get, post, put, del } from '@/app/api/request';  // 引入封装的工具
import type { Reader } from '../components/ReaderManagement';

// 获取读者列表
export function getReaderList() {
  return get('/reader');
}

// 添加读者
export function addReader(readerData: Omit<Reader, 'id' | 'borrowedCount'>): Promise<any> {
  return post('/reader', readerData);
}

// 更新读者
export function updateReader(id: number, readerData: Partial<Reader>): Promise<any> {
  return put(`/reader/${id}`, readerData);
}

// 删除读者
export function deleteReader(id: number): Promise<any> {
  return del(`/reader/${id}`);
}


export function getByUserNameAndPassword(readerData: {username: string, password: string}) {
  return post("/login", readerData);
}