import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Tag, Divider, Input, Button, message, Spin, Empty, Modal } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getArticleById, getArticleComments, createComment, getCurrentUser } from '../../api';

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

interface CommentUser {
  id: number;
  username: string;
  user_type?: 'guest' | 'real';
  role: string;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  replies?: Comment[];
  is_admin?: number;
  user?: CommentUser;
}

interface CurrentUser {
  id: number;
  username: string;
  role: string;
  status: number;
}

const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
  const user = comment.user;

  return (
    <div className="comment-item" style={{ marginLeft: depth * 24 }}>
      <div className="comment-avatar">
        <UserOutlined />
      </div>
      <div className="comment-content-wrap">
        <div className="comment-header">
          <strong>{user?.username || '已注销用户'}</strong>
          {user?.role === 'admin' || comment.is_admin ? <Tag color="gold">管理员</Tag> : null}
          {user?.role === 'admin' ? null : user?.user_type === 'guest' ? <Tag color="purple">游客(历史)</Tag> : <Tag color="blue">真实用户</Tag>}
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
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!id) return;
    loadArticle();
    loadComments();
    loadCurrentUser();
  }, [id]);

  useEffect(() => {
    const sync = () => loadCurrentUser();
    window.addEventListener('user-auth-change', sync as EventListener);
    return () => window.removeEventListener('user-auth-change', sync as EventListener);
  }, []);

  const promptLoginWhenComment = () => {
    Modal.confirm({
      title: '登录后可评论',
      content: '当前身份为“游客”，发表评论前请先登录。也可以在右上角注册账号后再评论。',
      okText: '去登录',
      cancelText: '取消',
      onOk: () => navigate(`/user/login?from=${encodeURIComponent(location.pathname + location.search)}`)
    });
  };

  const loadCurrentUser = async () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const res: any = await getCurrentUser();
      setCurrentUser(res?.data || null);
    } catch {
      setCurrentUser(null);
      localStorage.removeItem('user_token');
    }
  };

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
    if (!currentUser) {
      promptLoginWhenComment();
      return;
    }

    if (!commentContent.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    try {
      await createComment({
        article_id: Number(id),
        content: commentContent
      });
      message.success('评论成功');
      setCommentContent('');
      loadComments();
    } catch (error: any) {
      message.error(error?.response?.data?.message || '评论失败');
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
          <div className="comment-login-tip" style={{ marginBottom: 4 }}>
            当前身份：
            {currentUser
              ? `${currentUser.username}（真实用户${currentUser.status === 1 ? '' : ' / 已禁用'}）`
              : '游客'}
          </div>
          <Input.TextArea
            placeholder={currentUser ? '写下你的看法...' : '点击输入框后将提示登录'}
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={4}
            onClick={() => {
              if (!currentUser) promptLoginWhenComment();
            }}
            readOnly={!currentUser}
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
