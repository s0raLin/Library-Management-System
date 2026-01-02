import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, PackagePlus, PackageMinus } from 'lucide-react';
import { toast } from 'sonner';

export interface Book {
  id: number;
  code: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string;
  publishDate: string;
  price: number;
  entryDate: string;
  totalQuantity: number;
  stockQuantity: number;
  borrowTimes: number;
}

interface BookManagementProps {
  books: Book[];
  onAddBook: (book: Omit<Book, 'id' | 'code' | 'borrowTimes'>) => Promise<void>;
  onUpdateBook: (id: number, book: Partial<Book>) => void;
  onDeleteBook: (id: number) => void;
  onPurchase: (bookId: number, quantity: number, supplier: string) => void;
  onDiscard: (bookId: number, quantity: number) => void;
}

export function BookManagement({ books, onAddBook, onUpdateBook, onDeleteBook, onPurchase, onDiscard }: BookManagementProps) {
  console.log('books in BookManagement:', books);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    category: '',
    publishDate: '',
    price: 0,
    entryDate: new Date().toISOString().split('T')[0],
    totalQuantity: 0,
    stockQuantity: 0,
  });

  const [purchaseData, setPurchaseData] = useState({
    quantity: 1,
    supplier: '',
  });

  const categories = ['文学', '计算机', '自然科学', '社会科学', '艺术', '历史', '其他'];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  console.log('filteredBooks:', filteredBooks);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author) {
      toast.error('请填写必填项');
      return;
    }
    try {
      await onAddBook(formData);
      toast.success('图书添加成功！');
      setIsAddDialogOpen(false);
      setFormData({
        title: '',
        author: '',
        publisher: '',
        isbn: '',
        category: '',
        publishDate: '',
        price: 0,
        entryDate: new Date().toISOString().split('T')[0],
        totalQuantity: 0,
        stockQuantity: 0,
      });
    } catch (error) {
      toast.error('添加图书失败');
    }
  };

  const handlePurchase = () => {
    if (!selectedBook || purchaseData.quantity <= 0) {
      toast.error('请填写正确的采购数量');
      return;
    }
    onPurchase(selectedBook.id, purchaseData.quantity, purchaseData.supplier);
    toast.success(`成功采购 ${purchaseData.quantity} 本《${selectedBook.title}》`);
    setIsPurchaseDialogOpen(false);
    setPurchaseData({ quantity: 1, supplier: '' });
    setSelectedBook(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">图书管理</h2>
          <p className="text-gray-500">管理图书信息、采购入库和出库</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加图书
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加新图书</DialogTitle>
              <DialogDescription>填写图书详细信息</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">书名 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">作者 *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">出版社</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publishDate">出版日期</Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">价格（元）</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryDate">入库日期</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalQuantity">总数量</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">库存量</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">添加</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索书名、作者或ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="全部分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>图书编码</TableHead>
                <TableHead>书名</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>总量</TableHead>
                <TableHead>库存</TableHead>
                <TableHead>借阅次数</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    暂无图书数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-mono text-sm">{book.code}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{book.category}</Badge>
                    </TableCell>
                    <TableCell>{book.totalQuantity}</TableCell>
                    <TableCell>
                      <span className={book.stockQuantity === 0 ? 'text-red-600' : ''}>
                        {book.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell>{book.borrowTimes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBook(book);
                            setIsPurchaseDialogOpen(true);
                          }}
                        >
                          <PackagePlus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (book.stockQuantity > 0) {
                              onDiscard(book.id, 1);
                              toast.success('图书已出库');
                            } else {
                              toast.error('库存不足');
                            }
                          }}
                        >
                          <PackageMinus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm(`确定要删除《${book.title}》吗？`)) {
                              onDeleteBook(book.id);
                              toast.success('图书已删除');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>图书采购入库</DialogTitle>
            <DialogDescription>
              {selectedBook && `为《${selectedBook.title}》添加库存`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseQuantity">采购数量</Label>
              <Input
                id="purchaseQuantity"
                type="number"
                min="1"
                value={purchaseData.quantity}
                onChange={(e) => setPurchaseData({ ...purchaseData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">供应商</Label>
              <Input
                id="supplier"
                value={purchaseData.supplier}
                onChange={(e) => setPurchaseData({ ...purchaseData, supplier: e.target.value })}
                placeholder="选填"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handlePurchase}>确认采购</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
