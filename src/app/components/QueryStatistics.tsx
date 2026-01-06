import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BookOpen, AlertCircle, Search } from 'lucide-react';
import type { Book } from './BookManagement';
import type { Reader } from './ReaderManagement';
import type { BorrowRecord } from './BorrowManagement';

type Category = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

interface QueryStatisticsProps {
  books: Book[];
  readers: Reader[];
  borrowRecords: BorrowRecord[];
  categories: Category[];
}

export function QueryStatistics({ books, readers, borrowRecords, categories }: QueryStatisticsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Debug logs for active readers calculation
    console.log('QueryStatistics: borrowRecords length:', borrowRecords.length);
    const activeRecords = borrowRecords.filter((r) => r.status === '借出' || r.status === '逾期');
    console.log('QueryStatistics: activeRecords length:', activeRecords.length);
    const activeReaderIds = activeRecords.map((r) => r.readerId);
    console.log('QueryStatistics: activeReaderIds:', activeReaderIds);
    const uniqueActiveReaders = new Set(activeReaderIds);
    console.log('QueryStatistics: uniqueActiveReaders size:', uniqueActiveReaders.size);
    console.log('QueryStatistics: all borrowRecords:', borrowRecords);

   // 热门图书统计
  const popularBooks = books
    .sort((a, b) => b.borrowTimes - a.borrowTimes)
    .slice(0, 10)
    .map((book) => ({
      name: book.title.length > 15 ? book.title.slice(0, 15) + '...' : book.title,
      借阅次数: book.borrowTimes,
    }));

  // 分类统计
  const categoryStats = books.reduce((acc, book) => {
    // 根据 categoryId 查找分类名称
    const categoryName = categories.find(cat => cat.id === book.categoryId)?.name || book.category || '未分类';
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName] += book.bookItems?.length || 0;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  // 逾期统计
  const overdueRecords = borrowRecords.filter((r) => r.status === '逾期');
  const totalOverdueFine = overdueRecords.reduce((sum, r) => sum + r.overdueFine, 0);

  // 库存查询
  const lowStockBooks = books.filter((b) => {
    const availableQuantity = b.bookItems?.filter(item => item.status === 'available')?.length || 0;
    return availableQuantity < 3 && availableQuantity > 0;
  });
  const outOfStockBooks = books.filter((b) => {
    const availableQuantity = b.bookItems?.filter(item => item.status === 'available')?.length || 0;
    return availableQuantity === 0;
  });

  const filteredBorrowRecords = borrowRecords.filter((record) => {
    const book = books.find((b) => b.id === record.bookId);
    const reader = readers.find((r) => r.id === record.readerId);
    
    let matchesSearch = true;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      matchesSearch =
        book?.title.toLowerCase().includes(searchLower) ||
        reader?.name.toLowerCase().includes(searchLower) ||
        false;
    }

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && record.borrowDate >= dateFrom;
    }
    if (dateTo) {
      matchesDate = matchesDate && record.borrowDate <= dateTo;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">查询统计</h2>
        <p className="text-gray-500">图书库存、借阅记录和数据分析</p>
      </div>

      <Tabs defaultValue="statistics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="statistics">数据统计</TabsTrigger>
          <TabsTrigger value="inventory">库存查询</TabsTrigger>
          <TabsTrigger value="records">借阅记录</TabsTrigger>
          <TabsTrigger value="overdue">逾期管理</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>热门图书排行</CardTitle>
                <CardDescription>借阅次数最多的前10本图书</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={popularBooks}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="借阅次数" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>图书分类分布</CardTitle>
                <CardDescription>各分类图书总量统计</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">总借阅次数</p>
                    <p className="text-3xl">{borrowRecords.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">活跃读者</p>
                    <p className="text-3xl">{new Set(borrowRecords.filter((r) => r.status === '借出' || r.status === '逾期').map((r) => r.readerId)).size}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">累计罚款</p>
                    <p className="text-3xl">¥{totalOverdueFine.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>库存预警</CardTitle>
                <CardDescription>库存不足的图书列表</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>图书编码</TableHead>
                      <TableHead>书名</TableHead>
                      <TableHead>作者</TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead>库存</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outOfStockBooks.map((book) => {
                      const availableQuantity = book.bookItems?.filter(item => item.status === 'available')?.length || 0;
                      const categoryName = categories.find(cat => cat.id === book.categoryId)?.name || book.category || '未知分类';
                      return (
                        <TableRow key={book.id}>
                          <TableCell className="font-mono text-sm">{book.code}</TableCell>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{categoryName}</TableCell>
                          <TableCell className="text-red-600">{availableQuantity}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                              已借完
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {lowStockBooks.map((book) => {
                      const availableQuantity = book.bookItems?.filter(item => item.status === 'available')?.length || 0;
                      const categoryName = categories.find(cat => cat.id === book.categoryId)?.name || book.category || '未知分类';
                      return (
                        <TableRow key={book.id}>
                          <TableCell className="font-mono text-sm">{book.code}</TableCell>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{categoryName}</TableCell>
                          <TableCell className="text-orange-600">{availableQuantity}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                              库存不足
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {lowStockBooks.length === 0 && outOfStockBooks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          所有图书库存充足
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <CardTitle>借阅记录查询</CardTitle>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索书名或读者姓名..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="开始日期"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      placeholder="结束日期"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>图书名称</TableHead>
                    <TableHead>作者</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>出版社</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>借阅人</TableHead>
                    <TableHead>借出日期</TableHead>
                    <TableHead>应还日期</TableHead>
                    <TableHead>实还日期</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        暂无记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBorrowRecords.slice(0, 50).map((record) => {
                      const book = books.find((b) => b.id === record.bookId);
                      const reader = readers.find((r) => r.id === record.readerId);
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell>{book?.title || record.bookTitle || '未知'}</TableCell>
                          <TableCell>{book?.author || '未知'}</TableCell>
                          <TableCell>{book?.isbn || '未知'}</TableCell>
                          <TableCell>{book?.publisher || '未知'}</TableCell>
                          <TableCell>{book?.category || '未知'}</TableCell>
                          <TableCell>{reader?.name || '未知'}</TableCell>
                          <TableCell>{record.borrowDate}</TableCell>
                          <TableCell>{record.dueDate}</TableCell>
                          <TableCell>{record.returnDate || '-'}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                record.status === '已还'
                                  ? 'bg-green-100 text-green-700'
                                  : record.status === '逾期'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {record.status}
                            </span>
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

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>逾期图书管理</CardTitle>
              <CardDescription>当前逾期图书列表和罚款统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">逾期图书总数</p>
                    <p className="text-2xl text-red-700">{overdueRecords.length} 本</p>
                  </div>
                  <div>
                    <p className="text-sm text-red-600">累计罚款金额</p>
                    <p className="text-2xl text-red-700">¥{totalOverdueFine.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>图书名称</TableHead>
                    <TableHead>作者</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>出版社</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>借阅人</TableHead>
                    <TableHead>借出日期</TableHead>
                    <TableHead>应还日期</TableHead>
                    <TableHead>逾期天数</TableHead>
                    <TableHead>罚款金额</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                        暂无逾期图书
                      </TableCell>
                    </TableRow>
                  ) : (
                    overdueRecords.map((record) => {
                      const book = books.find((b) => b.id === record.bookId);
                      const reader = readers.find((r) => r.id === record.readerId);
                      const overdueDays = Math.floor(
                        (new Date().getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      return (
                        <TableRow key={record.id}>
                          <TableCell>{book?.title || record.bookTitle || '未知'}</TableCell>
                          <TableCell>{book?.author || '未知'}</TableCell>
                          <TableCell>{book?.isbn || '未知'}</TableCell>
                          <TableCell>{book?.publisher || '未知'}</TableCell>
                          <TableCell>{book?.category || '未知'}</TableCell>
                          <TableCell>{reader?.name || '未知'}</TableCell>
                          <TableCell>{record.borrowDate}</TableCell>
                          <TableCell className="text-red-600">{record.dueDate}</TableCell>
                          <TableCell className="text-red-600">{overdueDays} 天</TableCell>
                          <TableCell className="text-red-600">
                            ¥{record.overdueFine.toFixed(2)}
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
