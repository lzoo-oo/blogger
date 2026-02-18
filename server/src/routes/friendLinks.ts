import { Router, Response } from 'express';
import { FriendLink } from '../models';
import { AuthRequest, ApiResponse } from '../types';
import authMiddleware from '../middlewares/auth';

const router = Router();

// GET /api/friendlinks - 获取友链列表（公开）
router.get('/friendlinks', async (_req, res: Response) => {
  try {
    const links = await FriendLink.findAll({ order: [['id', 'ASC']] });
    res.json({ code: 200, message: '获取成功', data: links } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// POST /api/my/friendlinks - 新增友链（需鉴权）
router.post('/my/friendlinks', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, link_url, logo_url } = req.body;

  if (!name || !link_url) {
    res.json({ code: 400, message: '名称和链接不能为空' } as ApiResponse);
    return;
  }

  try {
    const link = await FriendLink.create({
      name,
      link_url,
      logo_url: logo_url || ''
    });
    res.json({ code: 200, message: '添加成功', data: link } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// PUT /api/my/friendlinks/:id - 编辑友链（需鉴权）
router.put('/my/friendlinks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, link_url, logo_url } = req.body;

  try {
    const link = await FriendLink.findByPk(id);
    if (!link) {
      res.json({ code: 404, message: '友链不存在' } as ApiResponse);
      return;
    }

    await link.update({
      name: name || link.name,
      link_url: link_url || link.link_url,
      logo_url: logo_url !== undefined ? logo_url : link.logo_url
    });
    res.json({ code: 200, message: '更新成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// DELETE /api/my/friendlinks/:id - 删除友链（需鉴权）
router.delete('/my/friendlinks/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const link = await FriendLink.findByPk(id);
    if (!link) {
      res.json({ code: 404, message: '友链不存在' } as ApiResponse);
      return;
    }

    await link.destroy();
    res.json({ code: 200, message: '删除成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

export default router;
