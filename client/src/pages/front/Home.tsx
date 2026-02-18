import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, List, Tag, Pagination, Empty, Spin } from 'antd';
import { getArticles } from '../../api';

interface Article {
  id: number;
  title: string;
  summary: string;
  cover: string;
  view_count: number;
  created_at: string;
  category?: { id: number; name: string };
  tags?: { id: number; name: string }[];
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadArticles();
  }, [page]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles({ page, pageSize: 10 });
      setArticles(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('加载文章失败:', error);
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

  if (!articles.length) {
    return <Empty description="暂无文章" />;
  }

  return (
    <div>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
        dataSource={articles}
        renderItem={(article) => (
          <List.Item>
            <Card
              hoverable
              cover={
                article.cover ? (
                  <img alt={article.title} src={article.cover} style={{ height: 200, objectFit: 'cover' }} />
                ) : null
              }
              actions={[
                <Link to={`/article/${article.id}`}>阅读全文</Link>,
              ]}
            >
              <Card.Meta
                title={article.title}
                description={
                  <>
                    <p style={{ color: '#666', marginBottom: 8 }}>
                      {article.summary?.substring(0, 100)}...
                    </p>
                    <div>
                      {article.category && (
                        <Tag color="blue">{article.category.name}</Tag>
                      )}
                      {article.tags?.map((tag) => (
                        <Tag key={tag.id}>{tag.name}</Tag>
                      ))}
                    </div>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
      <Pagination
        current={page}
        total={total}
        pageSize={10}
        onChange={setPage}
        style={{ textAlign: 'center', marginTop: 24 }}
      />
    </div>
  );
}
