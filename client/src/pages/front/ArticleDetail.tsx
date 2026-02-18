import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tag, Divider, Input, Button, message, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getArticleById, getArticleComments, createComment } from '../../api';

interface Article {
  id: number;
  title: string;
  content: string;
  cover_img: string;
  view_count: number;
  created_at: string;
  category?: { id: number; name: string } | null;
  tags?: { id: number; name: string }[];
}

interface Comment {
  id: number;
  content: string;
  nickname: string;
  created_at: string;
  replies?: Comment[];
  is_admin?: number;
}

const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
  return (
    <div className="comment-item" style={{ marginLeft: depth * 24 }}>
      <div className="comment-avatar">
        <UserOutlined />
      </div>
      <div className="comment-content-wrap">
        <div className="comment-header">
          <strong>{comment.nickname}</strong>
          {comment.is_admin ? <Tag color="gold">博主</Tag> : null}
          <span>{new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <p>{comment.content}</p>
        {comment.replies?.length
          ? comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} depth={depth + 1} />)
          : null}
      </div>
    </div>
  );
};

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!id) return;
    loadArticle();
    loadComments();
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await getArticleById(Number(id));
      setArticle(res.data);
    } catch {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    if (!id) return;
    try {
      const res = await getArticleComments(Number(id));
      setComments(res.data || []);
    } catch {
      setComments([]);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !nickname.trim()) {
      message.warning('请填写昵称和评论内容');
      return;
    }

    try {
      await createComment({
        article_id: Number(id),
        content: commentContent,
        nickname,
        email
      });
      message.success('评论成功');
      setCommentContent('');
      loadComments();
    } catch {
      message.error('评论失败');
    }
  };

  if (loading) {
    return (
      <div className="center-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="glass-panel section-panel">
        <Empty description="文章不存在" />
      </div>
    );
  }

  return (
    <div className="front-page-stack">
      <article className="glass-panel section-panel article-detail-panel">
        <h1>{article.title}</h1>
        <div className="article-detail-meta">
          <span>{new Date(article.created_at).toLocaleDateString()}</span>
          <span>{article.view_count} 阅读</span>
          {article.category ? <Tag color="blue">{article.category.name}</Tag> : null}
          {article.tags?.map((tag) => (
            <Tag key={tag.id}>{tag.name}</Tag>
          ))}
        </div>
        {article.cover_img ? <img src={article.cover_img} alt={article.title} className="detail-cover" /> : null}
        <Divider />
        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>

      <section className="glass-panel section-panel">
        <h3 style={{ marginBottom: 16 }}>评论区</h3>
        <div className="comment-form">
          <Input
            placeholder="昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ maxWidth: 240 }}
          />
          <Input
            placeholder="邮箱（可选）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <Input.TextArea
            placeholder="写下你的看法..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={4}
          />
          <Button type="primary" onClick={handleSubmitComment}>
            发表评论
          </Button>
        </div>

        <div className="comment-list">
          {!comments.length ? <Empty description="还没有评论" /> : comments.map((item) => <CommentItem key={item.id} comment={item} />)}
        </div>
      </section>
    </div>
  );
}
