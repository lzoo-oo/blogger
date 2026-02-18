import { Router, Response } from 'express';
import { Op } from 'sequelize';
import { Article, Category, Tag, Comment } from '../models';
import { AuthRequest, ApiResponse, PaginatedResponse } from '../types';
import authMiddleware from '../middlewares/auth';

const router = Router();

// GET /api/articles - 获取文章列表（公开）
router.get('/articles', async (req, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const cate_id = req.query.cate_id as string;
  const keyword = req.query.keyword as string;
  const status = req.query.status as string;

  const where: any = {};
  if (cate_id) where.cate_id = cate_id;
  if (keyword) {
    where.title = { [Op.like]: `%${keyword}%` };
  }
  // 前台只显示已发布的文章
  if (status === undefined) {
    where.status = 1;
  } else {
    where.status = parseInt(status);
  }

  try {
    const { count, rows } = await Article.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      order: [['is_top', 'DESC'], ['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: rows,
        total: count,
        page,
        pageSize
      } as PaginatedResponse<any>
    } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// GET /api/articles/:id - 获取文章详情（公开）
router.get('/articles/:id', async (req, res: Response) => {
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });

    if (!article) {
      res.json({ code: 404, message: '文章不存在' } as ApiResponse);
      return;
    }

    // 增加阅读量
    await article.increment('view_count');

    res.json({
      code: 200,
      message: '获取成功',
      data: article
    } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// POST /api/my/articles/add - 新增文章（需鉴权）
router.post('/my/articles/add', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, content, cover_img, summary, cate_id, tag_ids, status, is_top } = req.body;

  if (!title || !content) {
    res.json({ code: 400, message: '标题和内容不能为空' } as ApiResponse);
    return;
  }

  try {
    const article = await Article.create({
      title,
      content,
      cover_img: cover_img || '',
      summary: summary || title.substring(0, 50),
      cate_id: cate_id || null,
      status: status !== undefined ? status : 1,
      is_top: is_top || false,
      view_count: 0,
      like_count: 0
    });

    // 关联标签
    if (tag_ids && tag_ids.length > 0) {
      const tags = await Tag.findAll({ where: { id: tag_ids } });
      await (article as any).setTags(tags);
    }

    res.json({
      code: 200,
      message: '发布成功',
      data: { id: article.id }
    } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// PUT /api/my/articles/:id - 编辑文章（需鉴权）
router.put('/my/articles/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, cover_img, summary, cate_id, tag_ids, status, is_top } = req.body;

  try {
    const article = await Article.findByPk(id);
    if (!article) {
      res.json({ code: 404, message: '文章不存在' } as ApiResponse);
      return;
    }

    await article.update({
      title: title || article.title,
      content: content || article.content,
      cover_img: cover_img !== undefined ? cover_img : article.cover_img,
      summary: summary || article.summary,
      cate_id: cate_id !== undefined ? cate_id : article.cate_id,
      status: status !== undefined ? status : article.status,
      is_top: is_top !== undefined ? is_top : article.is_top
    });

    // 更新标签关联
    if (tag_ids) {
      const tags = await Tag.findAll({ where: { id: tag_ids } });
      await (article as any).setTags(tags);
    }

    res.json({ code: 200, message: '更新成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// DELETE /api/my/articles/:id - 删除文章（需鉴权）
router.delete('/my/articles/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const article = await Article.findByPk(id);
    if (!article) {
      res.json({ code: 404, message: '文章不存在' } as ApiResponse);
      return;
    }

    await article.destroy();
    res.json({ code: 200, message: '删除成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// PUT /api/my/articles/:id/top - 置顶/取消置顶
router.put('/my/articles/:id/top', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { is_top } = req.body;

  try {
    const article = await Article.findByPk(id);
    if (!article) {
      res.json({ code: 404, message: '文章不存在' } as ApiResponse);
      return;
    }

    await article.update({ is_top: is_top !== undefined ? is_top : !article.is_top });
    res.json({ code: 200, message: '操作成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

export default router;
