import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../models';
import { ApiResponse } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// POST /api/login - 管理员登录
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.json({ code: 400, message: '用户名和密码不能为空' } as ApiResponse);
    return;
  }

  try {
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      res.json({ code: 400, message: '用户不存在' } as ApiResponse);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.json({ code: 400, message: '密码错误' } as ApiResponse);
      return;
    }

    // 生成 JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          email: user.email
        }
      }
    } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

export default router;
