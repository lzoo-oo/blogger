import { Router, Response } from 'express';
import { Category } from '../models';
import { AuthRequest, ApiResponse } from '../types';
import authMiddleware from '../middlewares/auth';

const router = Router();

// GET /api/categories - 获取分类列表（公开）
router.get('/categories', async (_req, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'ASC']]
    });
    res.json({ code: 200, message: '获取成功', data: categories } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// POST /api/my/categories - 新增分类（需鉴权）
router.post('/my/categories', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, alias } = req.body;

  if (!name) {
    res.json({ code: 400, message: '分类名称不能为空' } as ApiResponse);
    return;
  }

  try {
    const exist = await Category.findOne({ where: { name } });
    if (exist) {
      res.json({ code: 400, message: '分类已存在' } as ApiResponse);
      return;
    }

    const category = await Category.create({ name, alias: alias || '' });
    res.json({ code: 200, message: '添加成功', data: category } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// PUT /api/my/categories/:id - 编辑分类（需鉴权）
router.put('/my/categories/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, alias } = req.body;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      res.json({ code: 404, message: '分类不存在' } as ApiResponse);
      return;
    }

    await category.update({ name: name || category.name, alias: alias || category.alias });
    res.json({ code: 200, message: '更新成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// DELETE /api/my/categories/:id - 删除分类（需鉴权）
router.delete('/my/categories/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      res.json({ code: 404, message: '分类不存在' } as ApiResponse);
      return;
    }

    await category.destroy();
    res.json({ code: 200, message: '删除成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

export default router;
