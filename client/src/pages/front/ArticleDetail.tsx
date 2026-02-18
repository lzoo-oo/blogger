import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tag, Divider, List, Avatar, Input, Button, message, Spin } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons';
import { getArticleById, getComments, createComment } from '../../api';

interface Article {
  id: number;
  title: string;
  content: string;
  cover: string;
  view_count: number;
  created_at: string;
  category?: { id: number; name: string };
  tags?: { id: number; name: string }[];
}

interface Comment {
  id: number;
  content: string;
  nickname: string;
  created_at: string;
  replies?: Comment[];
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (id) {
      loadArticle();
      loadComments();
    }
  }, [id]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await getArticleById(Number(id));
      setArticle(res.data);
    } catch (error) {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const res = await getComments({ article_id: Number(id) });
      setComments(res.data || []);
    } catch (error) {
      console.error('加载评论失败:', error);
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
      });
      message.success('评论成功');
      setCommentContent('');
      loadComments();
    } catch (error) {
      message.error('评论失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return <div>文章不存在</div>;
  }

  return (
    <div>
      <Card>
        <h1 style={{ fontSize: 28, marginBottom: 16 }}>{article.title}</h1>
        <div style={{ color: '#999', marginBottom: 16 }}>
          <span>发布时间：{new Date(article.created_at).toLocaleDateString()}</span>
          <span style={{ marginLeft: 16 }}>阅读：{article.view_count}</span>
          {article.category && (
            <Tag color="blue" style={{ marginLeft: 16 }}>{article.category.name}</Tag>
          )}
        </div>
        {article.tags && article.tags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {article.tags.map((tag) => (
              <Tag key={tag.id}>{tag.name}</Tag>
            ))}
          </div>
        )}
        <Divider />
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{ minHeight: 300 }}
        />
      </Card>

      <Card title="评论" style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="昵称"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ width: 200, marginRight: 16, marginBottom: 8 }}
          />
          <Input.TextArea
            placeholder="发表评论..."
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={3}
            style={{ marginBottom: 8 }}
          />
          <Button type="primary" onClick={handleSubmitComment}>
            发表评论
          </Button>
        </div>

        <List
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(comment) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={comment.nickname}
                description={comment.content}
              />
              <div style={{ fontSize: 12, color: '#999' }}>
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
