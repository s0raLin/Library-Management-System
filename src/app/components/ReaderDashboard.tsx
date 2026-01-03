import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BookOpen, BookMarked, AlertCircle, Clock } from 'lucide-react';
import type { BorrowRecord } from './BorrowManagement';
import type { Book } from './BookManagement';
import type { Reader } from './ReaderManagement';

interface ReaderDashboardProps {
  username: string;
  borrowRecords: BorrowRecord[];
  books: Book[];
  readers: Reader[];
}

export function ReaderDashboard({ username, borrowRecords, books, readers }: ReaderDashboardProps) {
  // 找到当前读者的信息
  const currentReader = readers.find(r => r.name === username);
  const readerId = currentReader?.id;

  // 获取当前读者的借阅记录
  const myBorrowRecords = borrowRecords.filter(r => r && r.readerId === readerId);
  const activeBorrows = myBorrowRecords.filter(r => r && (r.status === '借出' || r.status === '逾期'));
  const overdueBorrows = myBorrowRecords.filter(r => r && r.status === '逾期');
  const totalBorrowed = activeBorrows.length;

  const stats = [
    {
      title: '当前借阅',
      value: totalBorrowed,
      icon: BookMarked,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '逾期图书',
      value: overdueBorrows.length,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: '借阅限额',
      value: currentReader ? `${totalBorrowed}/${currentReader.borrowLimit}` : '0/0',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const recentBorrows = activeBorrows
    .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    .slice(0, 5)
    .map((record) => {
      const book = books.find((b) => b.id === record.bookId);
      return {
        id: record.id,
        bookTitle: book?.title || '未知',
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        status: record.status,
        overdueFine: record.overdueFine,
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">我的概览</h2>
        <p className="text-gray-500">查看您的借阅情况和个人信息</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>当前借阅</CardTitle>
          <CardDescription>您正在借阅的图书</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBorrows.length === 0 ? (
              <p className="text-center text-gray-500 py-4">暂无借阅记录</p>
            ) : (
              recentBorrows.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{record.bookTitle}</p>
                    <p className="text-sm text-gray-500">借出：{record.borrowDate}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${record.status === '逾期' ? 'text-red-600' : ''}`}>
                      {record.status === '逾期' ? '已逾期' : '应还'}：{record.dueDate}
                    </p>
                    {record.overdueFine > 0 && (
                      <p className="text-sm text-red-600">罚款：¥{record.overdueFine.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}