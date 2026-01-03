import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { BookManagement, type Book } from './components/BookManagement';
import { ReaderManagement, type Reader } from './components/ReaderManagement';
import { BorrowManagement, type BorrowRecord } from './components/BorrowManagement';
import { QueryStatistics } from './components/QueryStatistics';
import { ReaderDashboard } from './components/ReaderDashboard';
import { ReaderBorrowManagement } from './components/ReaderBorrowManagement';
import { Button } from './components/ui/button';
import { Library, BookOpen, Users, BookMarked, BarChart, LogOut, Menu, X } from 'lucide-react';
import { getBookList, addBook, updateBook, deleteBook, purchaseBook, discardBook } from '@/app/api/book.ts'
import { getReaderList, addReader, updateReader, deleteReader } from './api/reader';
import { toast } from 'sonner'
import { getBorrowList, borrowBook, returnBook, renewBook } from './api/borrow';
import { getCategoryMap } from './api/category';
type Page = 'dashboard' | 'books' | 'readers' | 'borrow' | 'statistics' | 'my-borrows';

type Category = {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem('library_login');
    return saved ? JSON.parse(saved).isLoggedIn : false;
  });
  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem('library_login');
    return saved ? JSON.parse(saved).username : '';
  });
  const [userRole, setUserRole] = useState<'admin' | 'reader'>(() => {
    const saved = localStorage.getItem('library_login');
    return saved ? JSON.parse(saved).userRole : 'admin';
  });
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 数据状态
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [nextBookId, setNextBookId] = useState(1);
  const [nextReaderId, setNextReaderId] = useState(1);
  const [nextRecordId, setNextRecordId] = useState(1);

  
  // 路由保护：确保用户只能访问允许的页面
  useEffect(() => {
    if (isLoggedIn && userRole === 'reader') {
      const allowedPages: Page[] = ['dashboard', 'my-borrows'];
      if (!allowedPages.includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    }
  }, [currentPage, userRole, isLoggedIn]);

  // 初始化示例数据
  useEffect(() => {
    const fetchData = async () => {
      console.log('Starting to fetch data...');
      try {
        // 从异步请求获取图书数据
        const sampleBooks: Book[] = await getBookList()
        // 读者数据
        const sampleReaders: Reader[] = await getReaderList()
        // 示例借阅记录
        const sampleRecords: BorrowRecord[] = await getBorrowList()
        // 获取类别
        const sampleCategories: Category[] = await getCategoryMap()

        const categoryList = sampleCategories.map(cat => cat.name)

        toast.success(categoryList.join(", "))

        setBooks(sampleBooks)
        setReaders(sampleReaders)
        setBorrowRecords(sampleRecords)
        setCategories(categoryList)

        // 计算下一个ID
        const maxBookId = sampleBooks.length > 0 ? Math.max(...sampleBooks.map(b => b.id)) : 0;
        const maxReaderId = sampleReaders.length > 0 ? Math.max(...sampleReaders.map(r => r.id)) : 0;
        const maxRecordId = sampleRecords.length > 0 ? Math.max(...sampleRecords.map(r => r.id)) : 0;

        setNextBookId(maxBookId + 1);
        setNextReaderId(maxReaderId + 1);
        setNextRecordId(maxRecordId + 1);
      } catch (error) {
        toast.error('错误: ' + (error instanceof Error ? error.message : String(error)));

        setBooks([])
        setReaders([])
        setBorrowRecords([])
        setCategories([])
      }
    };

    fetchData();
  }, []);

  // 登录处理
  const handleLogin = (user: string, role: 'admin' | 'reader') => {
    setUsername(user);
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage('dashboard'); // 确保登录后默认到dashboard
    localStorage.setItem('library_login', JSON.stringify({
      isLoggedIn: true,
      username: user,
      userRole: role
    }));
  };

  // 登出处理
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCurrentPage('dashboard');
    localStorage.removeItem('library_login');
  };

  // 图书管理函数
  const handleAddBook = async (bookData: Omit<Book, 'id' | 'code' | 'borrowTimes'>) => {
    try {
      const newBook = await addBook(bookData);
      setBooks([...books, newBook]);
    } catch (error) {
      toast.error('添加图书失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleUpdateBook = async (id: number, updates: Partial<Book>) => {
    try {
      await updateBook(id, updates);
      setBooks(books.map((book) => (book.id === id ? { ...book, ...updates } : book)));
      toast.success('图书信息更新成功');
    } catch (error) {
      toast.error('更新图书失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteBook = async (id: number) => {
    // 检查是否有活跃的借阅记录
    const activeBorrows = borrowRecords.filter(
      (record) => record && record.bookId === id && (record.status === '借出' || record.status === '逾期')
    );

    if (activeBorrows.length > 0) {
      toast.error('该图书有未归还的借阅记录，无法删除');
      return;
    }

    try {
      await deleteBook(id);
      setBooks(books.filter((book) => book.id !== id));
      toast.success('图书删除成功');
    } catch (error) {
      toast.error('删除图书失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handlePurchase = async (bookId: number, quantity: number, supplier: string) => {
    try {
      await purchaseBook(bookId, quantity, supplier);
      setBooks(
        books.map((book) =>
          book.id === bookId
            ? {
                ...book,
                totalQuantity: book.totalQuantity + quantity,
                stockQuantity: book.stockQuantity + quantity,
              }
            : book
        )
      );
      toast.success('采购成功');
    } catch (error) {
      toast.error('采购失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDiscard = async (bookId: number, quantity: number) => {
    try {
      await discardBook(bookId, quantity);
      setBooks(
        books.map((book) =>
          book.id === bookId
            ? {
                ...book,
                totalQuantity: Math.max(0, book.totalQuantity - quantity),
                stockQuantity: Math.max(0, book.stockQuantity - quantity),
              }
            : book
        )
      );
      toast.success('废弃成功');
    } catch (error) {
      toast.error('废弃失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 读者管理函数
  const handleAddReader = async (readerData: Omit<Reader, 'id' | 'borrowedCount'>) => {
    try {
      const newReader = await addReader(readerData);
      setReaders([...readers, newReader]);
      toast.success('读者添加成功');
    } catch (error) {
      toast.error('添加读者失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleUpdateReader = async (id: number, updates: Partial<Reader>) => {
    try {
      await updateReader(id, updates);
      setReaders(readers.map((reader) => (reader.id === id ? { ...reader, ...updates } : reader)));
      toast.success('读者信息更新成功');
    } catch (error) {
      toast.error('更新读者失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteReader = async (id: number) => {
    try {
      await deleteReader(id);
      setReaders(readers.filter((reader) => reader.id !== id));
      toast.success('读者删除成功');
    } catch (error) {
      toast.error('删除读者失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 借阅管理函数
  const handleBorrow = async (bookId: number, readerId: number) => {
    try {
      const newRecord = await borrowBook(bookId, readerId);
      setBorrowRecords([...borrowRecords, newRecord]);

      // 更新图书库存和借阅次数
      setBooks(
        books.map((book) =>
          book.id === bookId
            ? {
                ...book,
                stockQuantity: book.stockQuantity - 1,
                borrowTimes: book.borrowTimes + 1,
              }
            : book
        )
      );

      // 更新读者已借数量
      setReaders(
        readers.map((reader) =>
          reader.id === readerId
            ? { ...reader, borrowedCount: reader.borrowedCount + 1 }
            : reader
        )
      );

      toast.success('借书成功');
    } catch (error) {
      toast.error('借书失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleReturn = async (recordId: number) => {
    try {
      const updatedRecord = await returnBook(recordId);
      if (!updatedRecord) {
        throw new Error('返回的记录为空');
      }
      setBorrowRecords(
        borrowRecords.map((r) =>
          r.id === recordId ? updatedRecord : r
        )
      );

      // 更新图书库存
      setBooks(
        books.map((book) =>
          book.id === updatedRecord.bookId
            ? { ...book, stockQuantity: book.stockQuantity + 1 }
            : book
        )
      );

      // 更新读者已借数量
      setReaders(
        readers.map((reader) =>
          reader.id === updatedRecord.readerId
            ? { ...reader, borrowedCount: Math.max(0, reader.borrowedCount - 1) }
            : reader
        )
      );

      toast.success('还书成功');
    } catch (error) {
      toast.error('还书失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleRenew = async (recordId: number) => {
    try {
      const updatedRecord = await renewBook(recordId);
      setBorrowRecords(
        borrowRecords.map((record) =>
          record.id === recordId ? updatedRecord : record
        )
      );
      toast.success('续借成功');
    } catch (error) {
      toast.error('续借失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };


  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 计算统计数据
  const stats = {
    totalBooks: books.reduce((sum, book) => sum + book.totalQuantity, 0),
    availableBooks: books.reduce((sum, book) => sum + book.stockQuantity, 0),
    totalReaders: readers.length,
    activeBorrows: borrowRecords.filter((r) => r && (r.status === '借出' || r.status === '逾期')).length,
    overdueBooks: borrowRecords.filter((r) => r && r.status === '逾期').length,
  };

  
  const recentBorrows = borrowRecords
    .filter((r) => r && (r.status === '借出' || r.status === '逾期'))
    .slice(-5)
    .reverse()
    .map((record) => {
      const book = books.find((b) => b.id === record.bookId);
      const reader = readers.find((r) => r.id === record.readerId);
      return {
        id: record.id,
        bookTitle: book?.title || '未知',
        readerName: reader?.name || '未知',
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
      };
    });

  const menuItems = userRole === 'admin' ? [
    { id: 'dashboard' as Page, label: '数据概览', icon: Library },
    { id: 'books' as Page, label: '图书管理', icon: BookOpen },
    { id: 'readers' as Page, label: '读者管理', icon: Users },
    { id: 'borrow' as Page, label: '借阅管理', icon: BookMarked },
    { id: 'statistics' as Page, label: '查询统计', icon: BarChart },
  ] : [
    { id: 'dashboard' as Page, label: '我的概览', icon: Library },
    { id: 'my-borrows' as Page, label: '我的借阅', icon: BookMarked },
  ];

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">图书管理系统</h1>
                <p className="text-sm text-gray-500">
                  欢迎，{username} ({userRole === 'admin' ? '管理员' : '读者'})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={`
            fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] 
            w-64 bg-white border-r border-gray-200 
            transition-transform duration-300 z-40
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors
                    ${
                      currentPage === item.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && userRole === 'admin' && <Dashboard stats={stats} recentBorrows={recentBorrows} />}
            {currentPage === 'dashboard' && userRole === 'reader' && <ReaderDashboard username={username} borrowRecords={borrowRecords} books={books} readers={readers} />}
            {currentPage === 'books' && userRole === 'admin' && (
              <BookManagement
                books={books}
                categories={categories}
                onAddBook={handleAddBook}
                onUpdateBook={handleUpdateBook}
                onDeleteBook={handleDeleteBook}
                onPurchase={handlePurchase}
                onDiscard={handleDiscard}
              />
            )}
            {currentPage === 'readers' && userRole === 'admin' && (
              <ReaderManagement
                readers={readers}
                onAddReader={handleAddReader}
                onUpdateReader={handleUpdateReader}
                onDeleteReader={handleDeleteReader}
              />
            )}
            {currentPage === 'borrow' && userRole === 'admin' && (
              <BorrowManagement
                books={books}
                readers={readers}
                borrowRecords={borrowRecords}
                onBorrow={handleBorrow}
                onReturn={handleReturn}
                onRenew={handleRenew}
              />
            )}
            {currentPage === 'my-borrows' && userRole === 'reader' && (
              <ReaderBorrowManagement
                username={username}
                books={books}
                readers={readers}
                borrowRecords={borrowRecords}
                onReturn={handleReturn}
                onRenew={handleRenew}
              />
            )}
            {currentPage === 'statistics' && userRole === 'admin' && (
              <QueryStatistics books={books} readers={readers} borrowRecords={borrowRecords} />
            )}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
