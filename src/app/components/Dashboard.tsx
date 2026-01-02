import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Users, BookMarked, TrendingUp, AlertCircle, Package } from 'lucide-react';

interface DashboardProps {
  stats: {
    totalBooks: number;
    availableBooks: number;
    totalReaders: number;
    activeBorrows: number;
    overdueBooks: number;
  };
  recentBorrows: Array<{
    id: number;
    bookTitle: string;
    readerName: string;
    borrowDate: string;
    dueDate: string;
  }>;
}

export function Dashboard({ stats, recentBorrows }: DashboardProps) {
  const statCards = [
    {
      title: '图书总数',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '可借图书',
      value: stats.availableBooks,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '读者总数',
      value: stats.totalReaders,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '借阅中',
      value: stats.activeBorrows,
      icon: BookMarked,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: '逾期图书',
      value: stats.overdueBooks,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">数据概览</h2>
        <p className="text-gray-500">系统运行状态和关键指标</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近借阅记录</CardTitle>
          <CardDescription>最新的图书借阅情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBorrows.length === 0 ? (
              <p className="text-center text-gray-500 py-4">暂无借阅记录</p>
            ) : (
              recentBorrows.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{record.bookTitle}</p>
                    <p className="text-sm text-gray-500">借阅人：{record.readerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">借出：{record.borrowDate}</p>
                    <p className="text-sm text-gray-500">应还：{record.dueDate}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
