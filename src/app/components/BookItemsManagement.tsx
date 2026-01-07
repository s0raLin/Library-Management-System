import React, { useState, useEffect } from "react";
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
import { Plus, Search, Trash2, Edit, AlertTriangle, CheckCircle, Clock, BookOpen, Archive } from "lucide-react";
import { toast } from "sonner";
import {
  getBookItemList,
  getBookItemById,
  addBookItem,
  updateBookItem,
  deleteBookItem,
  type BookItem
} from "../api/bookitem";

export function BookItemsManagement() {
  const [bookItems, setBookItems] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBookItem, setSelectedBookItem] = useState<BookItem | null>(null);

  const [formData, setFormData] = useState({
    bookId: 0,
    barcode: "",
    location: "",
    status: "available",
    priceAtEntry: 0,
    entryDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // 获取状态图标和颜色
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'available':
        return { icon: CheckCircle, color: 'text-green-600', label: '可借阅' };
      case 'borrowed':
        return { icon: BookOpen, color: 'text-blue-600', label: '已借出' };
      case 'unavailable':
        return { icon: AlertTriangle, color: 'text-red-600', label: '不可用' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600', label: '未知状态' };
    }
  };

  // 加载图书单例列表
  const loadBookItems = async () => {
    try {
      setLoading(true);
      const data = await getBookItemList();
      setBookItems(data);
    } catch (error) {
      toast.error('加载图书单例失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookItems();
  }, []);

  // 过滤图书单例
  const filteredBookItems = bookItems.filter((item) => {
    const matchesSearch =
      item.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 处理添加
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.barcode.trim()) {
      toast.error("请填写条形码");
      return;
    }
    if (formData.bookId <= 0) {
      toast.error("请选择图书ID");
      return;
    }

    try {
      await addBookItem(formData);
      toast.success("图书单例添加成功！");
      setIsAddDialogOpen(false);
      setFormData({
        bookId: 0,
        barcode: "",
        location: "",
        status: "available",
        priceAtEntry: 0,
        entryDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      loadBookItems();
    } catch (error) {
      console.error('Error adding book item:', error);
      toast.error("添加图书单例失败");
    }
  };

  // 处理编辑
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookItem) return;

    if (!formData.barcode.trim()) {
      toast.error("请填写条形码");
      return;
    }
    if (formData.bookId <= 0) {
      toast.error("请选择图书ID");
      return;
    }

    try {
      await updateBookItem(selectedBookItem.id, formData);
      toast.success("图书单例更新成功！");
      setIsEditDialogOpen(false);
      setSelectedBookItem(null);
      loadBookItems();
    } catch (error) {
      console.error('Error updating book item:', error);
      toast.error("更新图书单例失败");
    }
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个图书单例吗？')) return;

    try {
      await deleteBookItem(id);
      toast.success("图书单例删除成功！");
      loadBookItems();
    } catch (error) {
      console.error('Error deleting book item:', error);
      toast.error("删除图书单例失败");
    }
  };

  // 打开编辑对话框
  const openEditDialog = (item: BookItem) => {
    setSelectedBookItem(item);
    setFormData({
      bookId: item.bookId,
      barcode: item.barcode,
      location: item.location,
      status: item.status,
      priceAtEntry: item.priceAtEntry,
      entryDate: item.entryDate,
      notes: item.notes,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">图书单例管理</h2>
          <p className="text-gray-500">管理单个图书单例的增删改查</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加图书单例
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加新图书单例</DialogTitle>
              <DialogDescription>填写图书单例详细信息</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookId">图书ID *</Label>
                  <Input
                    id="bookId"
                    type="number"
                    value={formData.bookId}
                    onChange={(e) =>
                      setFormData({ ...formData, bookId: parseInt(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">条形码 *</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">位置</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">可借阅</SelectItem>
                      <SelectItem value="borrowed">已借出</SelectItem>
                      <SelectItem value="unavailable">不可用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceAtEntry">入库价格（元）</Label>
                  <Input
                    id="priceAtEntry"
                    type="number"
                    step="0.01"
                    value={formData.priceAtEntry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceAtEntry: parseFloat(e.target.value) || 0,
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
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notes">备注</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="备注信息"
                  />
                </div>
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索条形码、位置或备注..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="available">可借阅</SelectItem>
                <SelectItem value="borrowed">已借出</SelectItem>
                <SelectItem value="unavailable">不可用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>图书ID</TableHead>
                <TableHead>条形码</TableHead>
                <TableHead>位置</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>入库价格</TableHead>
                <TableHead>入库日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredBookItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    暂无图书单例数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookItems.map((item) => {
                  const statusInfo = getStatusInfo(item.status);

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.bookId}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.barcode}
                      </TableCell>
                      <TableCell>{item.location || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>¥{item.priceAtEntry}</TableCell>
                      <TableCell>{item.entryDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑图书单例</DialogTitle>
            <DialogDescription>修改图书单例信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bookId">图书ID *</Label>
                <Input
                  id="edit-bookId"
                  type="number"
                  value={formData.bookId}
                  onChange={(e) =>
                    setFormData({ ...formData, bookId: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-barcode">条形码 *</Label>
                <Input
                  id="edit-barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">位置</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">可借阅</SelectItem>
                    <SelectItem value="borrowed">已借出</SelectItem>
                    <SelectItem value="unavailable">不可用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priceAtEntry">入库价格（元）</Label>
                <Input
                  id="edit-priceAtEntry"
                  type="number"
                  step="0.01"
                  value={formData.priceAtEntry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceAtEntry: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entryDate">入库日期</Label>
                <Input
                  id="edit-entryDate"
                  type="date"
                  value={formData.entryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, entryDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-notes">备注</Label>
                <Input
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="备注信息"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                取消
              </Button>
              <Button type="submit">更新</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}