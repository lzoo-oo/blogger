import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { FileTextOutlined, UserOutlined, MessageOutlined, EyeOutlined } from '@ant-design/icons';
import { getDashboardStats } from '../../api';

interface Stats {
  articleCount: number;
  commentCount: number;
  viewCount: number;
  categoryCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    articleCount: 0,
    commentCount: 0,
    viewCount: 0,
    categoryCount: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data || stats);
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="文章总数"
              value={stats.articleCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="评论总数"
              value={stats.commentCount}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={stats.viewCount}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="分类数量"
              value={stats.categoryCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
