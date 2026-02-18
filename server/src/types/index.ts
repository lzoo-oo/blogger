import { Request } from 'express';

// 扩展 Express Request 类型
export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 分页查询参数
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  cate_id?: number;
  status?: number;
}

// 分页响应
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
