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

  const featured = articles[0];
  const articleList = articles.slice(1);

  return (
    <div className="front-page-stack">
      <section className="hero-card glass-panel">
        <div className="hero-copy">
          <p className="hero-kicker">Featured Story</p>
          <h2>
            <Link to={`/article/${featured.id}`}>{featured.title}</Link>
          </h2>
          <p>{featured.summary || '从一个可读、可持续维护的结构开始，持续打磨内容价值。'}</p>
          <div className="hero-meta">
            <span>{new Date(featured.created_at).toLocaleDateString()}</span>
            <span>{featured.view_count} 阅读</span>
          </div>
          <div className="hero-tags">
            {featured.category ? <Tag color="blue">{featured.category.name}</Tag> : null}
            {featured.tags?.map((tag) => (
              <Tag key={tag.id}>{tag.name}</Tag>
            ))}
          </div>
          <Link to={`/article/${featured.id}`} className="hero-cta">
            阅读全文
          </Link>
        </div>

        <Link to={`/article/${featured.id}`} className="hero-media">
          {featured.cover_img ? (
            <img src={featured.cover_img} alt={featured.title} className="article-cover" />
          ) : (
            <div className="article-cover article-cover-fallback" />
          )}
        </Link>
      </section>

      {articleList.length ? (
        <section className="article-zone">
          <div className="section-head">
            <h3>最新文章</h3>
            <p>按发布时间持续更新，默认展示公开内容。</p>
          </div>
          <div className="article-grid">
            {articleList.map((article) => (
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
          </div>
        </section>
      ) : null}

      <div className="pagination-wrap glass-panel">
        <Pagination current={page} total={total} pageSize={9} onChange={setPage} />
      </div>
    </div>
  );
}
