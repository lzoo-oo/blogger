import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tag, Pagination, Empty, Spin } from 'antd';
import { getArticles, getCategoryById } from '../../api';

interface Article {
  id: number;
  title: string;
  summary: string;
  view_count: number;
  created_at: string;
  tags?: { id: number; name: string }[];
}

interface Category {
  id: number;
  name: string;
  alias: string;
}

export default function Category() {
  const { id } = useParams<{ id: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    loadCategory();
    loadArticles();
  }, [id, page]);

  const loadCategory = async () => {
    try {
      const res = await getCategoryById(Number(id));
      setCategory(res.data || null);
    } catch {
      setCategory(null);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles({ cate_id: Number(id), page, pageSize: 10 });
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

  return (
    <div className="front-page-stack">
      <section className="glass-panel section-panel">
        <h2>{category?.name || '分类文章'}</h2>
        <p className="muted">别名：{category?.alias || '未设置'}</p>
      </section>

      {!articles.length ? (
        <div className="glass-panel section-panel">
          <Empty description="该分类下暂无文章" />
        </div>
      ) : (
        <section className="glass-panel section-panel list-panel">
          {articles.map((article) => (
            <article key={article.id} className="list-item-row">
              <div>
                <Link to={`/article/${article.id}`} className="list-item-title">
                  {article.title}
                </Link>
                <p>{article.summary || '暂无摘要'}</p>
                <div>
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
      )}

      <div className="pagination-wrap glass-panel">
        <Pagination current={page} total={total} pageSize={10} onChange={setPage} />
      </div>
    </div>
  );
}
