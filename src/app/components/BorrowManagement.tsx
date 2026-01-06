import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookPlus, BookMinus, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Book } from './BookManagement';
import type { Reader } from './ReaderManagement';

export interface BorrowRecord {
  id: number;
  bookId: number;
  readerId: number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  overdueFine: number;
  status: '借出' | '已还' | '逾期';
  bookTitle: string;
}

interface BorrowManagementProps {
  books: Book[];
  readers: Reader[];
  borrowRecords: BorrowRecord[];
  onBorrow: (bookId: number, readerId: number, itemId: number) => void;
  onReturn: (recordId: number) => void;
  onRenew: (recordId: number) => void;
}

export function BorrowManagement({ books, readers, borrowRecords, onBorrow, onReturn, onRenew }: BorrowManagementProps) {
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedReaderId, setSelectedReaderId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSelectedItemId(null);
  }, [selectedBookId]);

  const activeBorrows = borrowRecords.filter((r) => r && (r.status === '借出' || r.status === '逾期'));
  const returnedBorrows = borrowRecords.filter((r) => r && r.status === '已还');

  const filteredActiveBorrows = activeBorrows.filter((record) => {
    const book = books.find((b) => b.id === record.bookId);
    const reader = readers.find((r) => r.id === record.readerId);
    const searchLower = searchTerm.toLowerCase();
    return (
      book?.title.toLowerCase().includes(searchLower) ||
      reader?.name.toLowerCase().includes(searchLower)
    );
  });

  const handleBorrow = () => {
    if (!selectedBookId || !selectedReaderId || !selectedItemId) {
      toast.error('请选择图书、读者和具体图书副本');
      return;
    }

    const book = books.find((b) => b.id === selectedBookId);
    const reader = readers.find((r) => r.id === selectedReaderId);

    if (!book || !reader) return;

    if (reader.borrowedCount >= reader.borrowLimit) {
      toast.error(`${reader.name} 已达借阅限额（${reader.borrowLimit}本）`);
      return;
    }

    onBorrow(selectedBookId, selectedReaderId, selectedItemId);
    toast.success(`${reader.name} 成功借阅《${book.title}》`);
    setIsBorrowDialogOpen(false);
    setSelectedBookId(null);
    setSelectedReaderId(null);
    setSelectedItemId(null);
  };

  const handleReturn = (record: BorrowRecord) => {
    const book = books.find((b) => b.id === record.bookId);
    const reader = readers.find((r) => r.id === record.readerId);
    
    if (!book || !reader) return;

    onReturn(record.id);
    
    if (record.status === '逾期' && record.overdueFine > 0) {
      toast.success(`还书成功！逾期罚款：¥${record.overdueFine.toFixed(2)}`);
    } else {
      toast.success('还书成功！');
    }
  };

  const getBookById = (id: number) => books.find((b) => b.id === id);
  const getReaderById = (id: number) => readers.find((r) => r.id === id);

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">借阅管理</h2>
          <p className="text-gray-500">办理借书、还书和续借业务</p>
        </div>
        <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <BookPlus className="w-4 h-4 mr-2" />
              办理借书
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>办理借书</DialogTitle>
              <DialogDescription>选择图书和读者</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>选择读者</Label>
                <Select
                  value={selectedReaderId?.toString()}
                  onValueChange={(value) => setSelectedReaderId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择读者" />
                  </SelectTrigger>
                  <SelectContent>
                    {readers.map((reader) => (
                      <SelectItem key={reader.id} value={reader.id.toString()}>
                        {reader.name} - {reader.classDept} ({reader.borrowedCount}/{reader.borrowLimit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>选择图书</Label>
                <Select
                  value={selectedBookId?.toString()}
                  onValueChange={(value) => setSelectedBookId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择图书" />
                  </SelectTrigger>
                  <SelectContent>
                    {books
                      .filter((book) => {
                        const availableQuantity = book.bookItems?.filter(item => item.status === 'available')?.length || 0;
                        return availableQuantity > 0;
                      })
                      .map((book) => {
                        const availableQuantity = book.bookItems?.filter(item => item.status === 'available')?.length || 0;
                        return (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.title} - {book.author} (可借: {availableQuantity})
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              {selectedBookId && (
                <div className="space-y-2">
                  <Label>选择图书副本</Label>
                  <Select
                    value={selectedItemId?.toString()}
                    onValueChange={(value) => setSelectedItemId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择图书副本" />
                    </SelectTrigger>
                    <SelectContent>
                      {books
                        .find((b) => b.id === selectedBookId)
                        ?.bookItems?.filter((item) => item.status === 'available')
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.barcode || `副本 ${item.id}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  借阅期限：30天 | 逾期罚款：0.1元/天
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBorrowDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleBorrow}>确认借书</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">借出中 ({activeBorrows.length})</TabsTrigger>
          <TabsTrigger value="returned">已归还 ({returnedBorrows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索书名或读者姓名..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>图书</TableHead>
                    <TableHead>借阅人</TableHead>
                    <TableHead>借出日期</TableHead>
                    <TableHead>应还日期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>罚款</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActiveBorrows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        暂无借阅记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActiveBorrows.map((record) => {
                      const reader = getReaderById(record.readerId);
                      const overdue = isOverdue(record.dueDate);

                      return (
                        <TableRow key={record.id}>
                          <TableCell>{record.bookTitle || '未知'}</TableCell>
                          <TableCell>{reader?.name || '未知'}</TableCell>
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
                    <TableHead>借阅人</TableHead>
                    <TableHead>借出日期</TableHead>
                    <TableHead>应还日期</TableHead>
                    <TableHead>实还日期</TableHead>
                    <TableHead>罚款</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnedBorrows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        暂无归还记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    returnedBorrows.slice(0, 50).map((record) => {
                      const reader = getReaderById(record.readerId);

                      return (
                        <TableRow key={record.id}>
                          <TableCell>{record.bookTitle || '未知'}</TableCell>
                          <TableCell>{reader?.name || '未知'}</TableCell>
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
