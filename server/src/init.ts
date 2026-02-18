import { sequelize } from './config/db';
import bcrypt from 'bcryptjs';
import { User } from './models';

async function initDatabase() {
  try {
    console.log('开始初始化数据库...');
    
    // 同步所有模型（创建表）
    await sequelize.sync({ alter: true });
    console.log('✓ 数据库表已创建/更新');
    
    // 检查是否已有管理员账户
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      // 创建默认管理员账户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        nickname: '管理员',
        avatar: '',
        email: 'admin@example.com',
        role: 'admin'
      });
      console.log('✓ 默认管理员账户已创建');
      console.log('  用户名：admin');
      console.log('  密码：admin123');
    } else {
      console.log('✓ 管理员账户已存在');
    }
    
    console.log('\n数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
