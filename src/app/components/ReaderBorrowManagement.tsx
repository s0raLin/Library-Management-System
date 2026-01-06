import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookMinus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { BorrowRecord } from './BorrowManagement';
import type { Book } from './BookManagement';
import type { Reader } from './ReaderManagement';

interface ReaderBorrowManagementProps {
  currentReader: any;
  books: Book[];
  readers: Reader[];
  borrowRecords: BorrowRecord[];
  onReturn: (recordId: number) => void;
  onRenew: (recordId: number) => void;
}

export function ReaderBorrowManagement({
  currentReader,
  books,
  readers,
  borrowRecords,
  onReturn,
  onRenew
}: ReaderBorrowManagementProps) {
  // 使用传递的currentReader
  const readerId = currentReader?.id;

  // 获取当前读者的借阅记录
  const myBorrowRecords = borrowRecords.filter(r => r && r.readerId === readerId);
  const activeBorrows = myBorrowRecords.filter((r) => r && (r.status === '借出' || r.status === '逾期'));
  const returnedBorrows = myBorrowRecords.filter((r) => r && r.status === '已还');

  const handleReturn = (record: BorrowRecord) => {
    const book = books.find((b) => b.id === record.bookId);

    if (!book) return;

    onReturn(record.id);

    if (record.status === '逾期' && record.overdueFine > 0) {
      toast.success(`还书成功！逾期罚款：¥${record.overdueFine.toFixed(2)}`);
    } else {
      toast.success('还书成功！');
    }
  };

  const getBookById = (id: number) => books.find((b) => b.id === id);

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">我的借阅</h2>
        <p className="text-gray-500">查看和管理您的借阅记录</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">借出中 ({activeBorrows.length})</TabsTrigger>
          <TabsTrigger value="returned">已归还 ({returnedBorrows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>图书</TableHead>
                    <TableHead>借出日期</TableHead>
                    <TableHead>应还日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>罚款</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBorrows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        暂无借阅记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeBorrows.map((record) => {
                      const book = getBookById(record.bookId);
                      const overdue = isOverdue(record.dueDate);

                      return (
                        <TableRow key={record.id}>
                          <TableCell>{book?.title || '未知'}</TableCell>
                          <TableCell>{record.borrowDate}</TableCell>
                          <TableCell className={overdue ? 'text-red-600' : ''}>
                            {record.dueDate}
                          </TableCell>
                          <TableCell>
                            <Badge variant={overdue ? 'destructive' : 'default'}>
                              {overdue ? '逾期' : '借出'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.overdueFine > 0 ? (
                              <span className="text-red-600">¥{record.overdueFine.toFixed(2)}</span>
                            ) : (
                              '¥0.00'
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleReturn(record)}>
                                <BookMinus className="w-4 h-4 mr-1" />
                                还书
                              </Button>
                              {!overdue && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    await onRenew(record.id);
                                    toast.success('续借成功，延长30天');
                                  }}
                                >
                                  续借
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returned">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>图书</TableHead>
                    <TableHead>借出日期</TableHead>
                    <TableHead>应还日期</TableHead>
                    <TableHead>实还日期</TableHead>
                    <TableHead>罚款</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnedBorrows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        暂无归还记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    returnedBorrows.slice(0, 50).map((record) => {
                      const book = getBookById(record.bookId);

                      return (
                        <TableRow key={record.id}>
                          <TableCell>{book?.title || '未知'}</TableCell>
                          <TableCell>{record.borrowDate}</TableCell>
                          <TableCell>{record.dueDate}</TableCell>
                          <TableCell>{record.returnDate}</TableCell>
                          <TableCell>
                            {record.overdueFine > 0 ? (
                              <span className="text-red-600">¥{record.overdueFine.toFixed(2)}</span>
                            ) : (
                              '¥0.00'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}