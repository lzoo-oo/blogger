import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { AuthRequest, ApiResponse } from '../types';
import authMiddleware from '../middlewares/auth';

const router = Router();

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  }
});

// POST /api/upload - 上传图片（需鉴权）
router.post('/upload', authMiddleware, upload.single('file'), (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.json({ code: 400, message: '请选择文件' } as ApiResponse);
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    code: 200,
    message: '上传成功',
    data: { url: fileUrl }
  } as ApiResponse);
});

export default router;
