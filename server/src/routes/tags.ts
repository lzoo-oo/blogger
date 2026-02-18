import { Router, Response } from 'express';
import { Tag } from '../models';
import { AuthRequest, ApiResponse } from '../types';
import authMiddleware from '../middlewares/auth';

const router = Router();

// GET /api/tags - 获取标签列表（公开）
router.get('/tags', async (_req, res: Response) => {
  try {
    const tags = await Tag.findAll({ order: [['id', 'ASC']] });
    res.json({ code: 200, message: '获取成功', data: tags } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// POST /api/my/tags - 新增标签（需鉴权）
router.post('/my/tags', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name) {
    res.json({ code: 400, message: '标签名称不能为空' } as ApiResponse);
    return;
  }

  try {
    const exist = await Tag.findOne({ where: { name } });
    if (exist) {
      res.json({ code: 400, message: '标签已存在' } as ApiResponse);
      return;
    }

    const tag = await Tag.create({ name });
    res.json({ code: 200, message: '添加成功', data: tag } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// PUT /api/my/tags/:id - 编辑标签（需鉴权）
router.put('/my/tags/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const tag = await Tag.findByPk(id);
    if (!tag) {
      res.json({ code: 404, message: '标签不存在' } as ApiResponse);
      return;
    }

    await tag.update({ name: name || tag.name });
    res.json({ code: 200, message: '更新成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// DELETE /api/my/tags/:id - 删除标签（需鉴权）
router.delete('/my/tags/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findByPk(id);
    if (!tag) {
      res.json({ code: 404, message: '标签不存在' } as ApiResponse);
      return;
    }

    await tag.destroy();
    res.json({ code: 200, message: '删除成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

export default router;
