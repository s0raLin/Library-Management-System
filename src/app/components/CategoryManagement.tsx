import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { Plus, Search, Trash2, Edit, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getCategoryList, addCategory, updateCategory, deleteCategory } from "@/app/api/category";

interface Category {
  id: number;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryManagementProps {
  onRefresh?: () => Promise<void>;
}

export function CategoryManagement({ onRefresh }: CategoryManagementProps = {}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  // 加载分类列表
  const loadCategories = async () => {
    try {
      setLoading(true);
      const result: Category[] = await getCategoryList();
      if (result) {
        setCategories(result);
      }
    } catch (error) {
      toast.error('加载分类列表失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // 过滤分类
  const filteredCategories = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 处理添加分类
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     const trimmedName = formData.name.trim();
     if (!trimmedName) {
       toast.error("请输入分类名称");
       return;
     }

     // 检查分类名称是否已存在
     if (categories.some(cat => cat.name === trimmedName)) {
       toast.error("分类名称已存在");
       return;
     }

     // 检查分类代码是否已存在（如果提供）
     const trimmedCode = formData.code.trim();
     if (trimmedCode && categories.some(cat => cat.code === trimmedCode)) {
       toast.error("分类代码已存在");
       return;
     }

     try {
       const categoryData: any = {
         name: trimmedName,
       };
       if (trimmedCode) {
         categoryData.code = trimmedCode;
       }
       await addCategory(categoryData);
       toast.success("分类添加成功");
       setIsAddDialogOpen(false);
       setFormData({ name: "", code: "" });
       loadCategories();
     } catch (error) {
       toast.error("添加分类失败: " + (error instanceof Error ? error.message : String(error)));
     }
   };

  // 处理更新分类
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !formData.name.trim()) {
      toast.error("请输入分类名称");
      return;
    }

    try {
      const updateData: any = {
        name: formData.name.trim(),
      };
      if (formData.code.trim()) {
        updateData.code = formData.code.trim();
      }
      await updateCategory(selectedCategory.id, updateData);
      toast.success("分类更新成功");
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: "", code: "" });
      loadCategories();
    } catch (error) {
      toast.error("更新分类失败: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 处理删除分类
  const handleDelete = async (category: Category) => {
    if (!confirm(`确定要删除分类"${category.name}"吗？\n\n注意：删除分类可能会影响相关的图书记录。`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      toast.success("分类删除成功");
      loadCategories();
    } catch (error) {
      toast.error("删除分类失败: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 打开编辑对话框
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">分类管理</h2>
          <p className="text-gray-500">管理图书分类信息</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onRefresh || loadCategories}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加分类
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新分类</DialogTitle>
              <DialogDescription>填写分类信息</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入分类名称"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">分类代码</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="留空将自动生成"
                />
                <p className="text-sm text-gray-500">如果不填写，将根据分类名称自动生成代码</p>
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
                placeholder="搜索分类名称或代码..."
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
                <TableHead>分类代码</TableHead>
                <TableHead>分类名称</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    {searchTerm ? "未找到匹配的分类" : "暂无分类数据"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-sm">
                      <Badge variant="secondary">{category.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(category.updatedAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(category)}
                          title="编辑分类"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category)}
                          title="删除分类"
                          className="text-red-600 hover:text-red-700"
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

      {/* 编辑分类对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
            <DialogDescription>修改分类信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">分类名称 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入分类名称"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">分类代码</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="留空将自动生成"
              />
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