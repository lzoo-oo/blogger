import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// 创建 Sequelize 实例 - 使用 SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// 测试数据库连接
async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功 (SQLite)');
  } catch (error) {
    console.error('数据库连接失败:', (error as Error).message);
  }
}

export { sequelize, testConnection };
