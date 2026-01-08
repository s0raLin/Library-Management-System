import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Library } from 'lucide-react';
import { toast } from 'sonner';
import { post } from '../api/request';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

interface LoginPageProps {
  onLogin: (username: string, role: 'admin' | 'reader', readerInfo?: any) => void;
}

type LoginType = 'admin' | 'reader';



export function LoginPage({ onLogin }: LoginPageProps) {
  const [loginType, setLoginType] = useState<LoginType>('reader');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('未知');
  const [classDept, setClassDept] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (expectedRole?: 'admin' | 'reader') => {
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await post('/login', { username, password });
      const { token, user: readerInfo, role } = response;

      if (expectedRole && role !== expectedRole) {
        toast.error(`登录失败：这不是${expectedRole === 'admin' ? '管理员' : '读者'}账号`);
        return;
      }

      // 存储token到localStorage
      localStorage.setItem('token', token);
      toast.success('登录成功！');
      onLogin(username, role, readerInfo);
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : (error.msg || '登录失败'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !name || !gender) {
      toast.error('请填写所有必填字段');
      return;
    }

    // 长度校验
    if (name.trim().length > 10) {
      toast.error('姓名长度不能超过12个字符');
      return;
    }
    if (username.trim().length < 3) {
      toast.error('用户名长度不能少于3个字符');
      return;
    }
    if (username.trim().length > 20) {
      toast.error('用户名长度不能超过20个字符');
      return;
    }
    if (password.length < 6) {
      toast.error('密码长度不能少于6个字符');
      return;
    }
    if (password.length > 16) {
      toast.error('密码长度不能超过16个字符');
      return;
    }
    if (contact && contact.trim().length > 20) {
      toast.error('联系方式长度不能超过20个字符');
      return;
    }
    if (classDept && classDept.trim().length > 20) {
      toast.error('班级/部门长度不能超过20个字符');
      return;
    }

    setIsLoading(true);
    try {
      const readerData = {
        name,
        gender,
        classDept,
        contact,
        username,
        password,
        readerType: '学生',
        borrowLimit: 3,
        borrowedCount: 0
      };
      await post('/reader', readerData);
      toast.success('注册成功！请登录');
      // 切换到登录标签
      setUsername('');
      setPassword('');
      setName('');
      setGender('');
      setClassDept('');
      setContact('');
    } catch (error: any) {
      toast.error(typeof error === 'string' ? error : (error.msg || '注册失败'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-2">
            <Library className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">图书管理系统</CardTitle>
          <CardDescription>中小学图书管理平台</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="reader-login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="admin-login">管理员登录</TabsTrigger>
              <TabsTrigger value="reader-login">读者登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            <TabsContent value="admin-login">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">管理员用户名</Label>
                  <Input
                    id="admin-username"
                    placeholder="请输入管理员用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">密码</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={isLoading} onClick={() => handleLogin('admin')}>
                  {isLoading ? '登录中...' : '管理员登录'}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="reader-login">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">用户名</Label>
                  <Input
                    id="login-username"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">密码</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={isLoading} onClick={() => handleLogin('reader')}>
                  {isLoading ? '登录中...' : '读者登录'}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="register">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">用户名 *</Label>
                  <Input
                    id="register-username"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">密码 *</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    placeholder="请输入姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性别 *</Label>
                  <Select value={gender} onValueChange={(value: '男' | '女' | '未知') => setGender(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                      <SelectItem value="未知">未知</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <Input
                    id="gender"
                    placeholder="请输入性别"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  /> */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classDept">班级/部门</Label>
                  <Select value={classDept} onValueChange={setClassDept}>
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
                  <Label htmlFor="contact">联系方式</Label>
                  <Input
                    id="contact"
                    placeholder="请输入联系方式"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <Button className="w-full" disabled={isLoading} onClick={handleRegister}>
                  {isLoading ? '注册中...' : '注册'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          {/* <div className="mt-4 text-sm text-gray-500 text-center">
            <p>测试账号：</p>
            <p>管理员 - admin / 123456</p>
            <p>读者 - reader / reader123</p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
