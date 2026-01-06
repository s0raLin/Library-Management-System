// src/utils/request.js 或 src/api/request.js
import axios from 'axios';

// 创建实例
const instance = axios.create({
  baseURL: "/api",  // 使用 Vite 代理的基础路径
  timeout: 10000,  // 请求超时时间（毫秒）
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    console.log('Making request:', config.method?.toUpperCase(), config.url);
    // 添加 Token（从 localStorage 获取）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // 可以在这里开启 loading
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    console.log('Response received:', response.config.url, response.data);
    // 统一处理成功响应（例如后端返回 { code: 200, data: ..., msg: '' }）
    const res = response.data;
    if (res.code !== 200) {  // 根据后端约定调整为 200
      // 错误提示（使用 Element UI、Ant Design 或自定义）
      console.error('API error:', res.msg || '请求失败', res);
      return Promise.reject(res);
    }
    console.log('Returning data:', res.data);
    return res.data;  // 只返回 data 部分
  },
  error => {
    console.error('Request failed:', error.config?.url, error.message);
    // 统一错误处理（如 401 跳转登录、网络错误提示）
    if (error.response?.status === 401) {
      // 清除本地存储的token和登录信息
      localStorage.removeItem('token');
      localStorage.removeItem('library_login');
      // 跳转登录页
      window.location.href = '/';
    }
    console.error('请求错误:', error.message);
    console.error('完整错误信息:', error);
    console.error('错误配置:', error.config);
    return Promise.reject(error);
  }
);

export default instance;

export function get(url: string, params = {}): Promise<any> {
  return instance.get(url, { params });
}

export function post(url: string, data = {}) {
  return instance.post(url, data, {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}

export function put(url: string, data = {}) {
  return instance.put(url, data);
}

export function del(url: string, params = {}) {
  return instance.delete(url, { params });
}
