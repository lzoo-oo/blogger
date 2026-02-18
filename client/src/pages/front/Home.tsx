import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Pagination, Empty, Spin } from 'antd';
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
      const res = await getArticles({ page, pageSize: 9 });
      setArticles(res?.data?.list || []);
      setTotal(res?.data?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="center-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="glass-panel section-panel">
        <Empty description="暂无文章" />
      </div>
    );
  }

  return (
    <div className="front-page-stack">
      <section className="hero-card glass-panel">
        <p className="hero-kicker">Editorial Notes</p>
        <h2>技术与审美并重的个人博客</h2>
        <p>记录系统设计、产品思考与高质量代码实践，持续迭代。</p>
      </section>

      <section className="article-grid">
        {articles.map((article) => (
          <article key={article.id} className="article-card glass-panel">
            <Link to={`/article/${article.id}`} className="cover-link">
              {article.cover_img ? (
                <img src={article.cover_img} alt={article.title} className="article-cover" />
              ) : (
                <div className="article-cover article-cover-fallback" />
              )}
            </Link>
            <div className="article-body">
              <Link to={`/article/${article.id}`} className="article-title">
                {article.title}
              </Link>
              <p className="article-summary">{article.summary || '暂无摘要'}</p>
              <div className="article-meta">
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                <span>{article.view_count} 阅读</span>
              </div>
              <div className="article-tags">
                {article.category ? <Tag color="blue">{article.category.name}</Tag> : null}
                {article.tags?.map((tag) => (
                  <Tag key={tag.id}>{tag.name}</Tag>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="pagination-wrap glass-panel">
        <Pagination current={page} total={total} pageSize={9} onChange={setPage} />
      </div>
    </div>
  );
}
