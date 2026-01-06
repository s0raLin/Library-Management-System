import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Library } from 'lucide-react';
import { toast } from 'sonner';
import { post } from '../api/request';

interface LoginPageProps {
  onLogin: (username: string, role: 'admin' | 'reader', readerInfo?: any) => void;
}



export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [classDept, setClassDept] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await post('/login', { username, password });
      const { token, user: readerInfo, role } = response;
      // 存储token到localStorage
      localStorage.setItem('token', token);
      toast.success('登录成功！');
      onLogin(username, role, readerInfo);
    } catch (error: any) {
      toast.error(error.msg || '登录失败');
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
      toast.error(error.msg || '注册失败');
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
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
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
                <Button className="w-full" disabled={isLoading} onClick={handleLogin}>
                  {isLoading ? '登录中...' : '登录'}
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    placeholder="请输入姓名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">性别 *</Label>
                  <Input
                    id="gender"
                    placeholder="请输入性别"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classDept">班级/部门</Label>
                  <Input
                    id="classDept"
                    placeholder="请输入班级或部门"
                    value={classDept}
                    onChange={(e) => setClassDept(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">联系方式</Label>
                  <Input
                    id="contact"
                    placeholder="请输入联系方式"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
                <Button className="w-full" disabled={isLoading} onClick={handleRegister}>
                  {isLoading ? '注册中...' : '注册'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>测试账号：</p>
            <p>管理员 - admin / admin123</p>
            <p>读者 - reader / reader123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
