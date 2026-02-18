import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Card, List, Tag, Pagination, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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

export default function Search() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState(keyword);

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setLoading(true);
    try {
      const res = await getArticles({ keyword: searchValue, page, pageSize: 10 });
      setArticles(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索文章..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          enterButton={<><SearchOutlined /> 搜索</>}
          size="large"
        />
      </Card>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : articles.length > 0 ? (
        <>
          <Card title={`搜索结果 (共 ${total} 篇)`}>
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
          </Card>
          <Pagination
            current={page}
            total={total}
            pageSize={10}
            onChange={(p) => { setPage(p); handleSearch(); }}
            style={{ textAlign: 'center', marginTop: 24 }}
          />
        </>
      ) : (
        keyword && <Empty description="未找到相关文章" />
      )}
    </div>
  );
}
