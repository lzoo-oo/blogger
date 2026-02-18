import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, List, Tag, Pagination, Empty, Spin } from 'antd';
import { getArticles, getCategoryById } from '../../api';

interface Article {
  id: number;
  title: string;
  summary: string;
  cover: string;
  view_count: number;
  created_at: string;
  tags?: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (id) {
      loadCategory();
      loadArticles();
    }
  }, [id, page]);

  const loadCategory = async () => {
    try {
      const res = await getCategoryById(Number(id));
      setCategory(res.data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles({ cate_id: Number(id), page, pageSize: 10 });
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

  return (
    <div>
      <Card title={category?.name || '分类文章'} style={{ marginBottom: 16 }}>
        <p style={{ color: '#666' }}>{category?.description}</p>
      </Card>

      {!articles.length ? (
        <Empty description="该分类下暂无文章" />
      ) : (
        <>
          <List
            dataSource={articles}
            renderItem={(article) => (
              <List.Item>
                <Card
                  hoverable
                  style={{ width: '100%' }}
                  onClick={() => window.location.href = `/article/${article.id}`}
                >
                  <Card.Meta
                    title={article.title}
                    description={
                      <>
                        <p style={{ color: '#666' }}>
                          {article.summary?.substring(0, 150)}...
                        </p>
                        <div>
                          <span style={{ marginRight: 16 }}>
                            阅读：{article.view_count}
                          </span>
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
        </>
      )}
    </div>
  );
}
