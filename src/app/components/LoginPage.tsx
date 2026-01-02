import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Library } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (username: string, role: 'admin' | 'reader') => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }
    
    // 模拟登录验证
    if (username === 'admin' && password === 'admin123') {
      toast.success('管理员登录成功！');
      onLogin(username, 'admin');
    } else if (username === 'reader' && password === 'reader123') {
      toast.success('读者登录成功！');
      onLogin(username, 'reader');
    } else {
      toast.error('用户名或密码错误');
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
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              登录
            </Button>
          </form>
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
