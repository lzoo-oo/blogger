import { Router, Response } from 'express';
import { Comment, Article } from '../models';
import { AuthRequest, ApiResponse } from '../types';
import authMiddleware from '../middlewares/auth';

const router = Router();

// POST /api/comments/add - 发表评论（公开）
router.post('/comments/add', async (req, res: Response) => {
  const { nickname, email, content, article_id, parent_id } = req.body;

  if (!nickname || !email || !content || !article_id) {
    res.json({ code: 400, message: '参数不完整' } as ApiResponse);
    return;
  }

  try {
    const article = await Article.findByPk(article_id);
    if (!article) {
      res.json({ code: 404, message: '文章不存在' } as ApiResponse);
      return;
    }

    const comment = await Comment.create({
      nickname,
      email,
      content,
      article_id,
      parent_id: parent_id || null,
      is_admin: false
    });

    res.json({ code: 200, message: '评论成功', data: comment } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// GET /api/comments/article/:id - 获取文章评论（公开）
router.get('/comments/article/:id', async (req, res: Response) => {
  const { id } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { article_id: id },
      order: [['created_at', 'DESC']]
    });

    // 构建树形结构
    const buildTree = (comments: any[], parentId: number | null = null): any[] => {
      return comments
        .filter(c => c.parent_id === parentId)
        .map(c => ({
          ...c.toJSON(),
          replies: buildTree(comments, c.id)
        }));
    };

    const tree = buildTree(comments as any[]);
    res.json({ code: 200, message: '获取成功', data: tree } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// GET /api/my/comments - 评论管理列表（需鉴权）
router.get('/my/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  try {
    const { count, rows } = await Comment.findAndCountAll({
      include: [{ model: Article, as: 'article', attributes: ['id', 'title'] }],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: { list: rows, total: count, page, pageSize }
    } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// DELETE /api/my/comments/:id - 删除评论（需鉴权）
router.delete('/my/comments/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByPk(id);
    if (!comment) {
      res.json({ code: 404, message: '评论不存在' } as ApiResponse);
      return;
    }

    await comment.destroy();
    res.json({ code: 200, message: '删除成功' } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

// POST /api/my/comments/reply - 博主回复评论（需鉴权）
router.post('/my/comments/reply', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { article_id, parent_id, content } = req.body;

  if (!article_id || !content) {
    res.json({ code: 400, message: '参数不完整' } as ApiResponse);
    return;
  }

  try {
    const comment = await Comment.create({
      nickname: '博主',
      email: '',
      content,
      article_id,
      parent_id: parent_id || null,
      is_admin: true
    });

    res.json({ code: 200, message: '回复成功', data: comment } as ApiResponse);
  } catch (error) {
    res.json({ code: 500, message: '服务器错误' } as ApiResponse);
  }
});

export default router;
