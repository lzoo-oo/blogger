import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, Article, Comment } from '../models';
import { AuthRequest, ApiResponse } from '../types';
import authMiddleware from '../middlewares/auth';

const router = Router();

// GET /api/settings - 获取博主信息（公开）
router.get('/settings', async (_req, res: Response) => {
  try {
    // 获取管理员信息（默认第一个用户）
    const user = await User.findOne({ where: { role: 'admin' } });
    if (!user) {
      res.json({ code: 404, message: '博主信息不存在' } as ApiResponse);
      return;
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        nickname: user.nickname,
        avatar: user.avatar,
        email: user.email
      }
    } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// GET /api/dashboard/stats - 获取仪表盘统计数据（需鉴权）
router.get('/my/dashboard/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const articleCount = await Article.count();
    const commentCount = await Comment.count();
    const viewCount = await Article.sum('view_count') || 0;

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        articleCount,
        commentCount,
        viewCount
      }
    } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// PUT /api/my/settings - 修改博主信息（需鉴权）
router.put('/my/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { nickname, avatar, email, password } = req.body;

  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      res.json({ code: 404, message: '用户不存在' } as ApiResponse);
      return;
    }

    const updateData: any = {
      nickname: nickname || user.nickname,
      avatar: avatar !== undefined ? avatar : user.avatar,
      email: email !== undefined ? email : user.email
    };

    // 如果要修改密码
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    res.json({ code: 200, message: '更新成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

export default router;
