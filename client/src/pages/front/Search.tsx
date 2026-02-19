import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Input, Tag, Pagination, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getArticles } from '../../api';

interface Article {
  id: number;
  title: string;
  summary: string;
  cover_img: string;
  view_count: number;
  created_at: string;
  category?: { id: number; name: string } | null;
  tags?: { id: number; name: string }[];
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keywordFromUrl = (searchParams.get('keyword') || '').trim();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState(keywordFromUrl);

  useEffect(() => {
    setSearchValue(keywordFromUrl);
    setPage(1);
    if (keywordFromUrl) {
      runSearch(keywordFromUrl, 1);
    } else {
      setArticles([]);
      setTotal(0);
    }
  }, [keywordFromUrl]);

  const runSearch = async (keyword: string, targetPage: number) => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await getArticles({ keyword, page: targetPage, pageSize: 10 });
      setArticles(res?.data?.list || []);
      setTotal(res?.data?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    const keyword = searchValue.trim();
    setPage(1);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="front-page-stack">
      <section className="glass-panel section-panel page-intro">
        <Input.Search
          placeholder="搜索标题、关键词..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          enterButton={<><SearchOutlined /> 搜索</>}
          size="large"
        />
      </section>

      {loading ? (
        <div className="center-loading">
          <Spin size="large" />
        </div>
      ) : articles.length > 0 ? (
        <section className="glass-panel section-panel list-panel media-list-panel">
          <h3 style={{ marginBottom: 10 }}>搜索结果（{total}）</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            关键词：{keywordFromUrl}
          </p>
          {articles.map((article) => (
            <article key={article.id} className="list-item-row media-list-row">
              <Link to={`/article/${article.id}`} className="media-list-cover">
                {article.cover_img ? (
                  <img src={article.cover_img} alt={article.title} />
                ) : (
                  <div className="article-cover article-cover-fallback" />
                )}
              </Link>
              <div className="media-list-main">
                <Link to={`/article/${article.id}`} className="list-item-title">
                  {article.title}
                </Link>
                <p>{article.summary || '暂无摘要'}</p>
                <div className="list-item-tags">
                  {article.category ? <Tag color="blue">{article.category.name}</Tag> : null}
                  {article.tags?.map((tag) => (
                    <Tag key={tag.id}>{tag.name}</Tag>
                  ))}
                </div>
              </div>
              <div className="list-item-meta">
                <span>{article.view_count} 阅读</span>
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </section>
      ) : keywordFromUrl ? (
        <div className="glass-panel section-panel">
          <Empty description="未找到相关文章" />
        </div>
      ) : null}

      {total > 10 ? (
        <div className="pagination-wrap glass-panel">
          <Pagination
            current={page}
            total={total}
            pageSize={10}
            onChange={(targetPage) => {
              setPage(targetPage);
              runSearch(keywordFromUrl, targetPage);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
