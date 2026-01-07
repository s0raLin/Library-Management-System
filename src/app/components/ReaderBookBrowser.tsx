import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
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
  Search,
  BookOpen,
  User,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { Book } from "./BookManagement";
import type { BorrowRecord } from "./BorrowManagement";
import type { Reader } from "./ReaderManagement";

interface ReaderBookBrowserProps {
  currentReader: any;
  books: Book[];
  readers: Reader[];
  borrowRecords: BorrowRecord[];
  categories: {
    id: number;
    name: string;
    code: string;
    createdAt: string;
    updatedAt: string;
  }[];
  onBorrow: (bookId: number, readerId: number, itemId: number) => void;
  onReturn: (recordId: number) => void;
}

export function ReaderBookBrowser({
  currentReader,
  books,
  readers,
  borrowRecords,
  categories,
  onBorrow,
  onReturn,
}: ReaderBookBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);

  // 使用传递的currentReader
  const readerId = currentReader?.id;
  const myBorrowRecords = borrowRecords.filter(
    (r) => r && r.readerId === readerId
  );
  const activeBorrows = myBorrowRecords.filter(
    (r) => r && (r.status === "借出" || r.status === "逾期")
  );

  const isBookBorrowedByMe = (bookId: number) =>
    activeBorrows.some((record) => record.bookId === bookId);
  const getBookBorrowRecord = (bookId: number) =>
    activeBorrows.find((record) => record.bookId === bookId);

  const filteredBooks = books.filter((book) => {
    if (book.isDeleted === 1) return false;
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm);
    const categoryName =
      categories.find((cat) => cat.id === book.categoryId)?.name ||
      book.category ||
      "";
    const matchesCategory =
      categoryFilter === "all" || categoryName === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getAvailableItems = (book: Book) =>
    book.bookItems?.filter((item) => item.status === "available") || [];

  const handleBorrow = async (book: Book) => {
    if (!readerId) {
      toast.error("读者信息未找到");
      return;
    }
    const availableItems = getAvailableItems(book);
    if (availableItems.length === 0) {
      toast.error("该图书暂无可借阅的实例");
      return;
    }
    if (currentReader && activeBorrows.length >= currentReader.borrowLimit) {
      toast.error(`已达到借阅限额（${currentReader.borrowLimit}本）`);
      return;
    }
    try {
      await onBorrow(book.id, readerId, availableItems[0].id);
      toast.success(`成功借阅《${book.title}》`);
      setIsBorrowDialogOpen(false);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleReturn = async (book: Book) => {
    const record = getBookBorrowRecord(book.id);
    if (!record) return;
    try {
      await onReturn(record.id);
      toast.success(`成功归还《${book.title}》`);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">图书馆藏</h2>
          <p className="text-gray-500">发现、检索并在线管理您的借阅预约</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索书名、作者或 ISBN..."
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
                <SelectItem value="all">所有分类</SelectItem>
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

          {/* 图书网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-20" />
                <p className="text-gray-500">
                  未找到相关图书，换个关键词试试？
                </p>
              </div>
            ) : (
              filteredBooks.map((book) => {
                const availableItems = getAvailableItems(book);
                const totalItems = book.bookItems?.length || 0;
                const isBorrowed = isBookBorrowedByMe(book.id);
                const categoryName =
                  categories.find((cat) => cat.id === book.categoryId)?.name ||
                  book.category ||
                  "未分类";

                return (
                  <Card
                    key={book.id}
                    className="flex flex-col h-full border border-gray-200 hover:bg-gray-50"
                  >
                    <CardHeader className="p-0">
                      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden rounded-t-xl">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full flex flex-col items-center justify-center text-gray-400 ${book.coverUrl ? 'hidden' : 'flex'}`}
                          style={{ display: book.coverUrl ? 'none' : 'flex' }}
                        >
                          <BookOpen className="w-12 h-12 mb-2" />
                          <span className="text-xs text-center px-2 leading-tight">
                            {book.title.length > 20 ? book.title.slice(0, 20) + '...' : book.title}
                          </span>
                        </div>
                        <Badge
                          className="absolute top-3 right-3 shadow-sm"
                          variant={
                            availableItems.length > 0 ? "default" : "secondary"
                          }
                        >
                          {availableItems.length > 0
                            ? `可借 ${availableItems.length}`
                            : "已借完"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 flex flex-col flex-grow">
                      <div className="mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-1 block">
                          {categoryName}
                        </span>
                        <CardTitle className="text-lg leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-1 text-sm">
                          <User className="w-3.5 h-3.5" />
                          {book.author}
                        </CardDescription>
                      </div>

                      {book.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 italic">
                          {book.description}
                        </p>
                      )}

                      {/* 底部信息与按钮 */}
                      <div className="mt-auto pt-4 space-y-4">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 border-t pt-3">
                          <span>ISBN: {book.isbn || "--"}</span>
                          <span>借阅 {book.borrowTimes} 次</span>
                        </div>

                        <div className="flex gap-2">
                          {isBorrowed ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                              onClick={() => handleReturn(book)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1.5" /> 还书
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={availableItems.length === 0}
                              className="flex-1 shadow-sm"
                              onClick={() => {
                                setSelectedBook(book);
                                setIsBorrowDialogOpen(true);
                              }}
                            >
                              <BookOpen className="w-4 h-4 mr-1.5" /> 借阅
                            </Button>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="px-3"
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">
                                  {book.title}
                                </DialogTitle>
                                <DialogDescription>
                                  由 {book.author} 著作 •{" "}
                                  {book.publisher || "未知出版社"}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                                  {book.coverUrl ? (
                                    <img
                                      src={book.coverUrl}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <BookOpen className="w-12 h-12 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div className="text-gray-500">
                                      分类：
                                      <span className="text-foreground font-medium">
                                        {categoryName}
                                      </span>
                                    </div>
                                    <div className="text-gray-500">
                                      价格：
                                      <span className="text-foreground font-medium">
                                        ¥{book.price.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="text-gray-500">
                                      库存：
                                      <span className="text-foreground font-medium">
                                        {totalItems} 册
                                      </span>
                                    </div>
                                    <div className="text-gray-500">
                                      入库日期：
                                      <span className="text-foreground font-medium">
                                        {book.entryDate}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="border-t pt-3">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-900">
                                      图书简介
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {book.description || "暂无简介"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 借阅确认对话框 */}
      <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认借阅申请</DialogTitle>
            <DialogDescription>
              请确认您的借阅信息，借阅成功后请前往服务台取书。
            </DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
                <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                  {selectedBook.coverUrl && (
                    <img
                      src={selectedBook.coverUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-gray-500 italic">
                    {selectedBook.author}
                  </p>
                </div>
              </div>

              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  activeBorrows.length >= (currentReader?.borrowLimit || 0)
                    ? "bg-red-50 border border-red-100"
                    : "bg-blue-50 border border-blue-100"
                }`}
              >
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    activeBorrows.length >= (currentReader?.borrowLimit || 0)
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                />
                <div>
                  <p className="text-sm font-semibold">借阅额度检查</p>
                  <p className="text-xs text-gray-600">
                    当前已借 {activeBorrows.length} 本，剩余额度{" "}
                    {(currentReader?.borrowLimit || 0) - activeBorrows.length}{" "}
                    本。
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsBorrowDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={() => handleBorrow(selectedBook)}
                  disabled={
                    activeBorrows.length >= (currentReader?.borrowLimit || 0)
                  }
                >
                  确认并借阅
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
