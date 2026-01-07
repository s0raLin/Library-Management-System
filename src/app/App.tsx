import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { BookManagement, type Book } from './components/BookManagement';
import { ReaderManagement, type Reader } from './components/ReaderManagement';
import { BorrowManagement, type BorrowRecord } from './components/BorrowManagement';
import { QueryStatistics } from './components/QueryStatistics';
import { ReaderDashboard } from './components/ReaderDashboard';
import { ReaderBorrowManagement } from './components/ReaderBorrowManagement';
import { ReaderBookBrowser } from './components/ReaderBookBrowser';
import { CategoryManagement } from './components/CategoryManagement';
import { BookItemsManagement } from './components/BookItemsManagement';
import { Button } from './components/ui/button';
import { Library, BookOpen, Users, BookMarked, BarChart, LogOut, Menu, X, Tag } from 'lucide-react';
import { getBookList, addBook, updateBook, deleteBook, purchaseBook, discardBook, updateBookItemStatus } from '@/app/api/book.ts'
import { getReaderList, addReader, updateReader, deleteReader } from './api/reader';
import { toast } from 'sonner'
import { getBorrowList, borrowBook, returnBook, renewBook } from './api/borrow';
import { getCategoryMap } from './api/category';
type Page = 'dashboard' | 'books' | 'bookitems' | 'categories' | 'readers' | 'borrow' | 'statistics' | 'my-borrows' | 'browse-books';

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
  const [currentReader, setCurrentReader] = useState<any>(() => {
    const saved = localStorage.getItem('library_login');
    return saved ? JSON.parse(saved).readerInfo : null;
  });
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 数据状态
  const [books, setBooks] = useState<Book[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  
  // 路由保护
  useEffect(() => {
    if (isLoggedIn && userRole === 'reader') {
      const allowedPages: Page[] = ['dashboard', 'my-borrows', 'browse-books'];
      if (!allowedPages.includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    }
  }, [currentPage, userRole, isLoggedIn]);

  // 初始化示例数据
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const fetchData = async () => {
      try {
        // 从异步请求获取图书数据
        const sampleBooks: Book[] = await getBookList()
        // 读者数据
        const sampleReaders: Reader[] = await getReaderList()
        // 示例借阅记录
        const sampleRecords: BorrowRecord[] = await getBorrowList()
        const filteredRecords = sampleRecords.filter(r => sampleBooks.some(b => b.id === r.bookId));
        // 获取类别
        const sampleCategories: Category[] = await getCategoryMap()

        setBooks(sampleBooks)
        setReaders(sampleReaders)
        setBorrowRecords(filteredRecords)
        setCategories(sampleCategories)

      } catch (error) {
        toast.error('错误: ' + (error instanceof Error ? error.message : String(error)));

        setBooks([])
        setReaders([])
        setBorrowRecords([])
        setCategories([])
      }
    };

    fetchData();
  }, [isLoggedIn]);

  // 刷新函数
  const refreshBooks = async () => {
    try {
      const updatedBooks = await getBookList();
      setBooks(updatedBooks);
      toast.success('图书数据已刷新');
    } catch (error) {
      toast.error('刷新图书数据失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const refreshReaders = async () => {
    try {
      const updatedReaders = await getReaderList();
      setReaders(updatedReaders);
      toast.success('读者数据已刷新');
    } catch (error) {
      toast.error('刷新读者数据失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const refreshBorrowRecords = async () => {
    try {
      const updatedRecords = await getBorrowList();
      const filteredRecords = updatedRecords.filter(r => books.some(b => b.id === r.bookId));
      setBorrowRecords(filteredRecords);
      toast.success('借阅记录已刷新');
    } catch (error) {
      toast.error('刷新借阅记录失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const refreshCategories = async () => {
    try {
      const updatedCategories = await getCategoryMap();
      setCategories(updatedCategories);
      toast.success('分类数据已刷新');
    } catch (error) {
      toast.error('刷新分类数据失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 登录处理
  const handleLogin = (user: string, role: 'admin' | 'reader', readerInfo?: any) => {
    setUsername(user);
    setUserRole(role);
    setCurrentReader(readerInfo);
    setIsLoggedIn(true);
    setCurrentPage('dashboard'); // 确保登录后默认到dashboard
    localStorage.setItem('library_login', JSON.stringify({
      isLoggedIn: true,
      username: user,
      userRole: role,
      readerInfo: readerInfo
    }));
  };

  // 登出处理
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCurrentReader(null);
    setCurrentPage('dashboard');
    localStorage.removeItem('library_login');
    localStorage.removeItem('token'); // 清除token
  };

  // 图书管理函数
  const handleAddBook = async (bookData: Omit<Book, 'id' | 'code' | 'borrowTimes' | 'isDeleted'>) => {
    try {
      console.log('handleAddBook called with:', bookData);
      const newBook = await addBook(bookData);
      console.log('Book added successfully:', newBook);
      
      // 添加图书后刷新整个图书列表，以获取完整的数据结构
      const updatedBooks = await getBookList();
      setBooks(updatedBooks);
    } catch (error) {
      console.error('handleAddBook error:', error);
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
    const book = books.find(b => b.id === id);
    if (!book) {
      toast.error('图书不存在');
      return;
    }

    // 检查是否有活跃的借阅记录
    const activeBorrows = borrowRecords.filter(
      (record) => record && record.bookId === id && (record.status === '借出' || record.status === '逾期')
    );

    if (activeBorrows.length > 0) {
      toast.error('该图书有未归还的借阅记录，无法删除');
      return;
    }

    // 显示确认对话框，说明删除后果
    const totalCopies = book.bookItems?.length || 0;
    const availableCopies = book.bookItems?.filter(item => item.status === 'available').length || 0;
    const unavailableCopies = totalCopies - availableCopies;

    let confirmMessage = `确定要删除《${book.title}》吗？\n\n`;
    confirmMessage += `删除后将同时删除所有图书副本（${totalCopies}本），包括：\n`;
    if (availableCopies > 0) confirmMessage += `- ${availableCopies}本可借阅副本\n`;
    if (unavailableCopies > 0) confirmMessage += `- ${unavailableCopies}本不可用副本\n`;
    confirmMessage += '\n此操作不可撤销。';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteBook(id);
      setBooks(books.filter((book) => book.id !== id));
      toast.success('图书及所有副本删除成功');
    } catch (error) {
      toast.error('删除图书失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handlePurchase = async (bookId: number, quantity: number, supplier: string) => {
    console.log('\n=== App.tsx Purchase Handler ===');
    console.log('Parameters received:', { bookId, quantity, supplier });
    
    try {
      console.log('Calling purchaseBook API...');
      const result = await purchaseBook(bookId, quantity, supplier);
      console.log('purchaseBook API result:', result);
      
      console.log('Refreshing book list...');
      const updatedBooks = await getBookList();
      console.log('Updated books received:', updatedBooks.length, 'books');
      
      // 查找更新后的特定图书
      const updatedBook = updatedBooks.find((book: Book) => book.id === bookId);
      if (updatedBook) {
        console.log('Updated book details:', {
          id: updatedBook.id,
          title: updatedBook.title,
          bookItemsCount: updatedBook.bookItems?.length || 0,
          bookItems: updatedBook.bookItems
        });
      }
      
      setBooks(updatedBooks);
      toast.success('采购成功');
      console.log('Purchase operation completed successfully');
    } catch (error) {
      console.error('Purchase operation failed:', error);
      toast.error('采购失败: ' + (error instanceof Error ? error.message : String(error)));
    }
    console.log('=== End App.tsx Purchase Handler ===\n');
  };

  const handleDiscard = async (bookId: number, quantity: number) => {
    console.log('\n=== App.tsx Discard Handler ===');
    console.log('Parameters received:', { bookId, quantity });

    try {
      console.log('Calling discardBook API...');
      const result = await discardBook(bookId, quantity);
      console.log('discardBook API result:', result);

      console.log('Refreshing book list...');
      const updatedBooks = await getBookList();
      console.log('Updated books received:', updatedBooks.length, 'books');

      // 查找更新后的特定图书
      const updatedBook = updatedBooks.find((book: Book) => book.id === bookId);
      if (updatedBook) {
        console.log('Updated book details:', {
          id: updatedBook.id,
          title: updatedBook.title,
          bookItemsCount: updatedBook.bookItems?.length || 0,
          availableCount: updatedBook.bookItems?.filter((item: any) => item.status === 'available').length || 0,
          unavailableCount: updatedBook.bookItems?.filter((item: any) => item.status === 'unavailable').length || 0,
          bookItems: updatedBook.bookItems
        });
      }

      setBooks(updatedBooks);
      toast.success('下架成功');
    } catch (error) {
      console.error('Discard operation failed:', error);
      toast.error('下架失败: ' + (error instanceof Error ? error.message : String(error)));
    }
    console.log('=== End App.tsx Discard Handler ===\n');
  };

  const handleUpdateBookItemStatus = async (itemId: number, status: string) => {
    try {
      console.log('Updating book item status:', { itemId, status });
      await updateBookItemStatus(itemId, status);
      // 刷新整个图书列表以获取更新后的数据
      const updatedBooks = await getBookList();
      setBooks(updatedBooks);
      toast.success('图书状态更新成功');
    } catch (error) {
      console.error('Book item status update failed:', error);
      toast.error('状态更新失败: ' + (error instanceof Error ? error.message : String(error)));
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
  const handleBorrow = async (bookId: number, readerId: number, itemId: number) => {
    try {
      const newRecord = await borrowBook(bookId, readerId, itemId);
      setBorrowRecords([...borrowRecords, newRecord]);

      // Update book borrow times and refresh book list to get updated bookItems
      const updatedBooks = await getBookList();
      setBooks(updatedBooks);

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

      // Refresh book list to get updated bookItems
      const updatedBooks = await getBookList();
      setBooks(updatedBooks);

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

  const totalBooks = books.reduce((sum, book) => {
    return sum + (book.bookItems?.length || 0);
  }, 0);
  
  const availableBooks = books.reduce((sum, book) => {
    if (book.isDeleted === 1) return sum;
    return sum + (book.bookItems?.filter(item => item.status === 'available')?.length || 0);
  }, 0);
  
  // 计算统计数据
  const stats = {
    totalBooks: totalBooks,
    availableBooks: availableBooks,
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
    { id: 'categories' as Page, label: '分类管理', icon: Tag },
    { id: 'readers' as Page, label: '读者管理', icon: Users },
    { id: 'borrow' as Page, label: '借阅管理', icon: BookMarked },
    { id: 'statistics' as Page, label: '查询统计', icon: BarChart },
  ] : [
    { id: 'dashboard' as Page, label: '我的概览', icon: Library },
    { id: 'browse-books' as Page, label: '图书浏览', icon: BookOpen },
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
            {currentPage === 'dashboard' && userRole === 'reader' && <ReaderDashboard currentReader={currentReader} borrowRecords={borrowRecords} books={books} readers={readers} />}
            {currentPage === 'books' && userRole === 'admin' && (
              <BookManagement
                books={books}
                categories={categories}
                onAddBook={handleAddBook}
                onUpdateBook={handleUpdateBook}
                onDeleteBook={handleDeleteBook}
                onPurchase={handlePurchase}
                onDiscard={handleDiscard}
                onUpdateBookItemStatus={handleUpdateBookItemStatus}
                onRefresh={refreshBooks}
              />
            )}
            {currentPage === 'categories' && userRole === 'admin' && (
              <CategoryManagement />
            )}
            {currentPage === 'readers' && userRole === 'admin' && (
              <ReaderManagement
                readers={readers}
                onAddReader={handleAddReader}
                onUpdateReader={handleUpdateReader}
                onDeleteReader={handleDeleteReader}
                onRefresh={refreshReaders}
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
                onRefresh={refreshBorrowRecords}
              />
            )}
            {currentPage === 'browse-books' && userRole === 'reader' && (
              <ReaderBookBrowser
                currentReader={currentReader}
                books={books}
                readers={readers}
                borrowRecords={borrowRecords}
                categories={categories}
                onBorrow={handleBorrow}
                onReturn={handleReturn}
              />
            )}
            {currentPage === 'my-borrows' && userRole === 'reader' && (
              <ReaderBorrowManagement
                currentReader={currentReader}
                books={books}
                readers={readers}
                borrowRecords={borrowRecords}
                onReturn={handleReturn}
                onRenew={handleRenew}
              />
            )}
            {currentPage === 'statistics' && userRole === 'admin' && (
              <QueryStatistics books={books} readers={readers} borrowRecords={borrowRecords} categories={categories} />
            )}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
