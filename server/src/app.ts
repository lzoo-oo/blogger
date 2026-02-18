import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import { sequelize, testConnection } from './config/db';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import categoryRoutes from './routes/categories';
import tagRoutes from './routes/tags';
import commentRoutes from './routes/comments';
import friendLinkRoutes from './routes/friendLinks';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3007;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源托管 - 上传的图片
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 路由
app.use('/api', authRoutes);
app.use('/api', articleRoutes);
app.use('/api', categoryRoutes);
app.use('/api', tagRoutes);
app.use('/api', commentRoutes);
app.use('/api', friendLinkRoutes);
app.use('/api', uploadRoutes);
app.use('/api', settingsRoutes);

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ code: 200, message: '服务运行正常' });
});

// 404 处理
app.use((_req: Request, res: Response) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// 错误处理中间件
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('服务器错误:', err.message);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库模型 (开发环境使用 alter: true)
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功');
    
    // 启动 Express 服务
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', (error as Error).message);
    process.exit(1);
  }
}

startServer();
