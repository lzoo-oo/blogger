import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, ApiResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// JWT 认证中间件
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.json({
      code: 401,
      message: '未登录，请先登录'
    } as ApiResponse);
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.json({
      code: 401,
      message: 'Token无效或已过期'
    } as ApiResponse);
  }
};

export default authMiddleware;
