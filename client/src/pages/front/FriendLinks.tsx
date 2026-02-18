import { useEffect, useState } from 'react';
import { Card, List, Avatar, Empty, Spin } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { getFriendLinks } from '../../api';

interface FriendLink {
  id: number;
  name: string;
  url: string;
  logo: string;
  description: string;
}

export default function FriendLinks() {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await getFriendLinks();
      setLinks(res.data || []);
    } catch (error) {
      console.error('加载友链失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card title="友情链接">
        {!links.length ? (
          <Empty description="暂无友情链接" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            dataSource={links}
            renderItem={(link) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => window.open(link.url, '_blank')}
                  style={{ textAlign: 'center' }}
                >
                  <Avatar
                    size={64}
                    src={link.logo}
                    icon={<LinkOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  <Card.Meta
                    title={link.name}
                    description={link.description || link.url}
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
