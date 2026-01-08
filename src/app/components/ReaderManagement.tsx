import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// 班级/部门选项
const classDeptOptions = [
  'Dept 1',
  'Dept 2',
  'Dept 3',
  'Dept 4',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4'
];

export interface Reader {
  id: number;
  name: string;
  gender: '男' | '女' | '未知';
  classDept: string;
  readerType: '学生' | '教师';
  contact: string;
  borrowLimit: number;
  borrowedCount: number;
  username: string;
  password: string;
}

interface ReaderManagementProps {
  readers: Reader[];
  onAddReader: (reader: Omit<Reader, 'id' | 'borrowedCount'>) => void;
  onUpdateReader: (id: number, reader: Partial<Reader>) => void;
  onDeleteReader: (id: number) => void;
  onRefresh: () => Promise<void>;
}

export function ReaderManagement({ readers, onAddReader, onUpdateReader, onDeleteReader, onRefresh }: ReaderManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '未知' as '男' | '女' | '未知',
    classDept: '',
    readerType: '学生' as '学生' | '教师',
    contact: '',
    borrowLimit: 3,
    username: '',
    password: '',
  });

  const filteredReaders = readers.filter((reader) => {
    const matchesSearch =
      reader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reader.classDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reader.contact.includes(searchTerm);
    const matchesType = typeFilter === 'all' || reader.readerType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('请填写姓名');
      return;
    }
    if (!formData.username) {
      toast.error('请填写用户名');
      return;
    }
    if (!formData.password) {
      toast.error('请填写密码');
      return;
    }

    // 长度校验
    if (formData.name.trim().length > 50) {
      toast.error('姓名长度不能超过50个字符');
      return;
    }
    if (formData.username.trim().length < 3) {
      toast.error('用户名长度不能少于3个字符');
      return;
    }
    if (formData.username.trim().length > 20) {
      toast.error('用户名长度不能超过20个字符');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('密码长度不能少于6个字符');
      return;
    }
    if (formData.password.length > 50) {
      toast.error('密码长度不能超过50个字符');
      return;
    }
    if (formData.contact && formData.contact.trim().length > 100) {
      toast.error('联系方式长度不能超过100个字符');
      return;
    }
    if (formData.classDept && formData.classDept.trim().length > 50) {
      toast.error('班级/部门长度不能超过50个字符');
      return;
    }

    onAddReader(formData);
    toast.success('读者添加成功！');
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReader) return;

    // 长度校验
    if (formData.name.trim().length > 50) {
      toast.error('姓名长度不能超过50个字符');
      return;
    }
    if (formData.username.trim().length < 3) {
      toast.error('用户名长度不能少于3个字符');
      return;
    }
    if (formData.username.trim().length > 20) {
      toast.error('用户名长度不能超过20个字符');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('密码长度不能少于6个字符');
      return;
    }
    if (formData.password.length > 50) {
      toast.error('密码长度不能超过50个字符');
      return;
    }
    if (formData.contact && formData.contact.trim().length > 100) {
      toast.error('联系方式长度不能超过100个字符');
      return;
    }
    if (formData.classDept && formData.classDept.trim().length > 50) {
      toast.error('班级/部门长度不能超过50个字符');
      return;
    }

    onUpdateReader(selectedReader.id, formData);
    toast.success('读者信息已更新！');
    setIsEditDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: '未知',
      classDept: '',
      readerType: '学生',
      contact: '',
      borrowLimit: 3,
      username: '',
      password: '',
    });
    setSelectedReader(null);
  };

  const openEditDialog = (reader: Reader) => {
    setSelectedReader(reader);
    setFormData({
      name: reader.name,
      gender: reader.gender,
      classDept: reader.classDept,
      readerType: reader.readerType,
      contact: reader.contact,
      borrowLimit: reader.borrowLimit,
      username: reader.username,
      password: reader.password,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">读者管理</h2>
          <p className="text-gray-500">管理学生和教师读者信息</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加读者
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新读者</DialogTitle>
              <DialogDescription>填写读者基本信息</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 * (最多50个字符)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={50}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select value={formData.gender} onValueChange={(value: '男' | '女' | '未知') => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                      <SelectItem value="未知">未知</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="readerType">读者类型</Label>
                  <Select
                    value={formData.readerType}
                    onValueChange={(value: '学生' | '教师') => {
                      setFormData({
                        ...formData,
                        readerType: value,
                        borrowLimit: value === '教师' ? 5 : 3,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="学生">学生</SelectItem>
                      <SelectItem value="教师">教师</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="classDept">班级/部门</Label>
                <Select value={formData.classDept} onValueChange={(value) => setFormData({ ...formData, classDept: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择班级或部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {classDeptOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">联系方式 (最多100个字符)</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="电话或邮箱"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">用户名 * (3-20个字符)</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  maxLength={20}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码 * (至少6个字符)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  maxLength={50}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrowLimit">借书限额</Label>
                <Input
                  id="borrowLimit"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.borrowLimit}
                  onChange={(e) => setFormData({ ...formData, borrowLimit: parseInt(e.target.value) || 3 })}
                />
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索姓名、班级或联系方式..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="学生">学生</SelectItem>
                <SelectItem value="教师">教师</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>性别</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>班级/部门</TableHead>
                <TableHead>联系方式</TableHead>
                <TableHead>已借/限额</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReaders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    暂无读者数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredReaders.map((reader) => (
                  <TableRow key={reader.id}>
                    <TableCell>{reader.name}</TableCell>
                    <TableCell>{reader.gender}</TableCell>
                    <TableCell>
                      <Badge variant={reader.readerType === '教师' ? 'default' : 'secondary'}>
                        {reader.readerType}
                      </Badge>
                    </TableCell>
                    <TableCell>{reader.classDept}</TableCell>
                    <TableCell>{reader.contact}</TableCell>
                    <TableCell>
                      <span className={reader.borrowedCount >= reader.borrowLimit ? 'text-red-600' : ''}>
                        {reader.borrowedCount} / {reader.borrowLimit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(reader)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (reader.borrowedCount > 0) {
                              toast.error('该读者还有未归还的图书，无法删除');
                              return;
                            }
                            if (confirm(`确定要删除读者"${reader.name}"吗？`)) {
                              onDeleteReader(reader.id);
                              toast.success('读者已删除');
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑读者信息</DialogTitle>
            <DialogDescription>修改读者基本信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">姓名 * (最多50个字符)</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={50}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-gender">性别</Label>
                <Select value={formData.gender} onValueChange={(value: '男' | '女' | '未知') => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                    <SelectItem value="未知">未知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-readerType">读者类型</Label>
                <Select
                  value={formData.readerType}
                  onValueChange={(value: '学生' | '教师') => setFormData({ ...formData, readerType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="学生">学生</SelectItem>
                    <SelectItem value="教师">教师</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-classDept">班级/部门</Label>
              <Select value={formData.classDept} onValueChange={(value) => setFormData({ ...formData, classDept: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择班级或部门" />
                </SelectTrigger>
                <SelectContent>
                  {classDeptOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact">联系方式 (最多100个字符)</Label>
              <Input
                id="edit-contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">用户名 * (3-20个字符)</Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                maxLength={20}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">密码 * (至少6个字符)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                maxLength={50}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-borrowLimit">借书限额</Label>
              <Input
                id="edit-borrowLimit"
                type="number"
                min="1"
                max="10"
                value={formData.borrowLimit}
                onChange={(e) => setFormData({ ...formData, borrowLimit: parseInt(e.target.value) || 3 })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
