import React, { useState, Fragment } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Plus, Search, Trash2, PackagePlus, PackageMinus, ChevronDown, ChevronRight, Edit, AlertTriangle, CheckCircle, Clock, Wrench, BookOpen, Archive } from "lucide-react";
import { toast } from "sonner";

export interface Book {
  id: number;
  code: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  categoryId: number;
  category: string;
  publishDate: string;
  price: number;
  entryDate: string;
  borrowTimes: number;
  isDeleted: number;
  description: string;
  coverUrl: string;
  bookItems: BookItem[];
}

interface BookItem {
  id: number;
  bookId: number;
  barcode: string;
  location: string;
  status: string;
  priceAtEntry: number;
  entryDate: string;
  notes: string;
}

type Category = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

interface BookManagementProps {
  books: Book[];
  categories: Category[];
  onAddBook: (
    book: Omit<Book, "id" | "code" | "borrowTimes" | "isDeleted">
  ) => Promise<void>;
  onUpdateBook: (id: number, book: Partial<Book>) => void;
  onDeleteBook: (id: number) => void;
  onPurchase: (bookId: number, quantity: number, supplier: string) => void;
  onDiscard: (bookId: number, quantity: number) => void;
  onUpdateBookItemStatus: (itemId: number, status: string) => void;
}

export function BookManagement({
  books,
  categories,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onPurchase,
  onDiscard,
  onUpdateBookItemStatus,
}: BookManagementProps) {
  console.log("=== BookManagement Debug Info ===");
  console.log("Total books:", books.length);
  console.log("Categories:", categories);
  
  books.forEach((book, index) => {
    console.log(`\n--- Book ${index + 1}: ${book.title} ---`);
    console.log("Book ID:", book.id);
    console.log("Code:", book.code);
    console.log("Category ID:", book.categoryId);
    console.log("Category Name:", book.category);
    console.log("BookItems count:", book.bookItems?.length || 0);
    
    if (book.bookItems && book.bookItems.length > 0) {
      console.log("BookItems details:");
      book.bookItems.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex + 1}:`, {
          id: item.id,
          bookId: item.bookId,
          barcode: item.barcode,
          location: item.location,
          status: item.status,
          priceAtEntry: item.priceAtEntry,
          entryDate: item.entryDate,
          notes: item.notes
        });
      });
    } else {
      console.log("No BookItems found for this book");
    }
  });
  
  console.log("=== End Debug Info ===\n");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    isbn: "",
    category: "",
    categoryId: 0,
    publishDate: "",
    price: 0,
    entryDate: new Date().toISOString().split("T")[0],
    description: "",
    coverUrl: "",
    borrowTimes: 0,
    isDeleted: 0,
    bookItems: [] as BookItem[],
  });

  const [purchaseData, setPurchaseData] = useState({
    quantity: 1,
    supplier: "",
  });

  // 展开/折叠图书详情
  const toggleBookExpansion = (bookId: number) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(bookId)) {
      newExpanded.delete(bookId);
    } else {
      newExpanded.add(bookId);
    }
    setExpandedBooks(newExpanded);
  };

  // 获取状态图标和颜色
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { icon: CheckCircle, color: 'text-green-600', label: '可借阅' };
      case 'borrowed':
        return { icon: BookOpen, color: 'text-blue-600', label: '已借出' };
      case 'damaged':
        return { icon: AlertTriangle, color: 'text-red-600', label: '损坏' };
      case 'lost':
        return { icon: AlertTriangle, color: 'text-red-600', label: '丢失' };
      case 'repairing':
        return { icon: Wrench, color: 'text-yellow-600', label: '维修中' };
      case 'reserved':
        return { icon: Clock, color: 'text-orange-600', label: '已预约' };
      case 'internal':
        return { icon: Archive, color: 'text-gray-600', label: '内部使用' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600', label: '未知状态' };
    }
  };

  // 处理单个bookItem状态更新
  const handleBookItemStatusChange = async (itemId: number, newStatus: string) => {
    try {
      await onUpdateBookItemStatus(itemId, newStatus);
      toast.success('图书状态更新成功');
    } catch (error) {
      toast.error('状态更新失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    
    const categoryName = categories.find(cat => cat.id === book.categoryId)?.name || book.category || '';
    const matchesCategory =
      categoryFilter === "all" || categoryName === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error("请填写书名和作者");
      return;
    }
    if (!formData.category) {
      toast.error("请选择分类");
      return;
    }
    if (formData.price < 0) {
      toast.error("价格不能为负数");
      return;
    }

    const selectedCategory = categories.find(cat => cat.name === formData.category);
    if (!selectedCategory) {
      toast.error("无效的分类选择");
      return;
    }

    try {
      const bookDataWithCategoryId = {
        ...formData,
        categoryId: selectedCategory.id
      };
      console.log('Submitting book data:', bookDataWithCategoryId);
      await onAddBook(bookDataWithCategoryId);
      toast.success("图书添加成功！");
      setIsAddDialogOpen(false);
      setFormData({
        title: "",
        author: "",
        publisher: "",
        isbn: "",
        category: "",
        categoryId: 0,
        publishDate: "",
        price: 0,
        entryDate: new Date().toISOString().split("T")[0],
        description: "",
        coverUrl: "",
        borrowTimes: 0,
        isDeleted: 0,
        bookItems: [] as BookItem[],
      });
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error("添加图书失败");
    }
  };

  const handlePurchase = async () => {
    console.log('\n=== Purchase Operation Debug ===');
    console.log('Selected Book:', selectedBook);
    console.log('Purchase Data:', purchaseData);
    
    if (!selectedBook || purchaseData.quantity <= 0) {
      console.log('Purchase validation failed');
      toast.error("请填写正确的采购数量");
      return;
    }
    
    try {
      console.log('Starting purchase operation...');
      console.log('Book ID:', selectedBook.id);
      console.log('Quantity:', purchaseData.quantity);
      console.log('Supplier:', purchaseData.supplier);
      console.log('Current BookItems before purchase:', selectedBook.bookItems);
      
      onPurchase(selectedBook.id, purchaseData.quantity, purchaseData.supplier);
      
      console.log('Purchase operation completed successfully');
      toast.success(
        `成功采购 ${purchaseData.quantity} 本《${selectedBook.title}》`
      );
      setIsPurchaseDialogOpen(false);
      setPurchaseData({ quantity: 1, supplier: "" });
      setSelectedBook(null);
    } catch (error) {
      console.error('Purchase error in component:', error);
      toast.error('采购失败: ' + (error instanceof Error ? error.message : String(error)));
    }
    console.log('=== End Purchase Debug ===\n');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">图书管理</h2>
          <p className="text-gray-500">管理图书信息、采购入库和出库</p>
        </div>
        <div className="flex items-center gap-4">
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
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">作者 *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher">出版社</Label>
                    <Input
                      id="publisher"
                      value={formData.publisher}
                      onChange={(e) =>
                        setFormData({ ...formData, publisher: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN</Label>
                    <Input
                      id="isbn"
                      value={formData.isbn}
                      onChange={(e) =>
                        setFormData({ ...formData, isbn: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">分类</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
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
                      onChange={(e) =>
                        setFormData({ ...formData, publishDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">价格（元）</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryDate">入库日期</Label>
                    <Input
                      id="entryDate"
                      type="date"
                      value={formData.entryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, entryDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">描述</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="图书描述"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverUrl">封面链接</Label>
                  <Input
                    id="coverUrl"
                    value={formData.coverUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, coverUrl: e.target.value })
                    }
                    placeholder="http://example.com/cover.jpg"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit">添加</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
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
                <TableHead className="w-8"></TableHead>
                <TableHead>图书编码</TableHead>
                <TableHead>书名</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>总册数</TableHead>
                <TableHead>可借册数</TableHead>
                <TableHead>借阅次数</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-gray-500 py-8"
                  >
                    暂无图书数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => {
                  const totalQuantity = book.bookItems?.length || 0;
                  const availableQuantity = book.bookItems?.filter(item => item.status === 'available' || item.status === 'reserved')?.length || 0;
                  const isExpanded = expandedBooks.has(book.id);

                  const categoryName = categories.find(cat => cat.id === book.categoryId)?.name || book.category || '未知分类';

                  console.log(`Book: ${book.title}, CategoryId: ${book.categoryId}, CategoryName: ${categoryName}, Total: ${totalQuantity}, Available: ${availableQuantity}`);
                  console.log(`BookItems for ${book.title}:`, book.bookItems);

                  return (
                    <Fragment key={book.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleBookExpansion(book.id)}
                            className="p-1 h-6 w-6"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {book.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{book.title}</div>
                            {book.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {book.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{categoryName}</Badge>
                        </TableCell>
                        <TableCell>{totalQuantity}</TableCell>
                        <TableCell>
                          <span
                            className={
                              availableQuantity === 0 ? "text-red-600" : ""
                            }
                          >
                            {availableQuantity}
                          </span>
                        </TableCell>
                        <TableCell>{book.borrowTimes}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                console.log('Purchase button clicked for book:', book);
                                setSelectedBook(book);
                                setIsPurchaseDialogOpen(true);
                              }}
                              title="采购入库"
                            >
                              <PackagePlus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                if (availableQuantity > 0) {
                                  try {
                                    await onDiscard(book.id, 1);
                                    toast.success("图书已出库");
                                  } catch (error) {
                                    toast.error("出库失败: " + (error instanceof Error ? error.message : String(error)));
                                  }
                                } else {
                                  toast.error("库存不足");
                                }
                              }}
                              title="废弃出库"
                              disabled={availableQuantity === 0}
                            >
                              <PackageMinus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                if (confirm(`确定要删除《${book.title}》吗？`)) {
                                  try {
                                    await onDeleteBook(book.id);
                                    toast.success("图书已删除");
                                  } catch (error) {
                                    toast.error("删除失败: " + (error instanceof Error ? error.message : String(error)));
                                  }
                                }
                              }}
                              title="删除图书"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* 展开的图书实例详情 */}
                      {isExpanded && book.bookItems && book.bookItems.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-gray-50 p-0">
                            <div className="p-4">
                              <h4 className="font-medium mb-3 text-sm">图书实例详情</h4>
                              <div className="grid gap-3">
                                {book.bookItems.map((item) => {
                                  const statusInfo = getStatusInfo(item.status);
                                  const StatusIcon = statusInfo.icon;

                                  return (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                      <div className="flex items-center gap-3">
                                        <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                                        <div>
                                          <div className="font-medium text-sm">条形码: {item.barcode}</div>
                                          <div className="text-xs text-gray-500">
                                            入库日期: {item.entryDate} | 入库价格: ¥{item.priceAtEntry}
                                          </div>
                                          {item.location && (
                                            <div className="text-xs text-gray-500">位置: {item.location}</div>
                                          )}
                                          {item.notes && (
                                            <div className="text-xs text-gray-500">备注: {item.notes}</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={statusInfo.color}>
                                          {statusInfo.label}
                                        </Badge>
                                        <Select
                                          value={item.status}
                                          onValueChange={(newStatus) => handleBookItemStatusChange(item.id, newStatus)}
                                        >
                                          <SelectTrigger className="w-32 h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="available">可借阅</SelectItem>
                                            <SelectItem value="borrowed">已借出</SelectItem>
                                            <SelectItem value="damaged">损坏</SelectItem>
                                            <SelectItem value="lost">丢失</SelectItem>
                                            <SelectItem value="repairing">维修中</SelectItem>
                                            <SelectItem value="reserved">已预约</SelectItem>
                                            <SelectItem value="internal">内部使用</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>图书采购入库</DialogTitle>
            <DialogDescription>
              {selectedBook && 
                `为《${selectedBook.title}》添加库存 | 当前总册数: ${selectedBook.bookItems?.length || 0} | 可借册数: ${selectedBook.bookItems?.filter(item => item.status === 'available')?.length || 0}`
              }
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
                onChange={(e) =>
                  setPurchaseData({
                    ...purchaseData,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">供应商</Label>
              <Input
                id="supplier"
                value={purchaseData.supplier}
                onChange={(e) =>
                  setPurchaseData({ ...purchaseData, supplier: e.target.value })
                }
                placeholder="选填"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPurchaseDialogOpen(false)}
              >
                取消
              </Button>
              <Button 
                onClick={handlePurchase}
                disabled={!selectedBook || purchaseData.quantity <= 0}
              >
                确认采购
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}