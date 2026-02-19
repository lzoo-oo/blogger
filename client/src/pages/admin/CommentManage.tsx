import { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Tag, Input, Space } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { getComments, deleteComment } from '../../api';

interface CommentUser {
  id: number;
  username: string;
  user_type?: 'guest' | 'real';
  role: string;
  status: number;
}

interface Comment {
  id: number;
  content: string;
  user_id: number;
  is_admin: number;
  created_at: string;
  article?: { id: number; title: string };
  user?: CommentUser;
}

export default function CommentManage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadComments();
  }, [page]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res: any = await getComments({
        page,
        pageSize: 10,
        keyword: keyword.trim() || undefined
      });
      setComments(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id);
      message.success('删除成功');
      loadComments();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    {
      title: '评论用户',
      dataIndex: 'user',
      key: 'user',
      width: 240,
      render: (user: CommentUser | undefined) => {
        if (!user) return '-';
        return (
          <Space>
            <span>{user.username}</span>
            {user.role === 'admin' ? <Tag color="gold">管理员</Tag> : null}
            {user.role !== 'admin' ? (user.user_type === 'guest' ? <Tag color="purple">游客(历史)</Tag> : <Tag color="blue">真实用户</Tag>) : null}
            {user.status === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>}
          </Space>
        );
      }
    },
    { title: '评论内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '文章',
      dataIndex: 'article',
      key: 'article',
      width: 220,
      render: (article: { id: number; title: string }) => article?.title || '-'
    },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 190 },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: any, record: Comment) => (
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>评论管理</h2>
        <Space>
          <Input.Search
            placeholder="按用户/内容/文章搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={() => {
              setPage(1);
              loadComments();
            }}
            style={{ width: 280 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={loadComments}>
            刷新
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage
        }}
      />
    </div>
  );
}
