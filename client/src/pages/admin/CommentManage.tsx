import { useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getComments, deleteComment } from '../../api';

interface Comment {
  id: number;
  content: string;
  nickname: string;
  email: string;
  status: number;
  created_at: string;
  article?: { id: number; title: string };
}

export default function CommentManage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadComments();
  }, [page]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await getComments({ page, pageSize: 10 });
      setComments(res.data?.data || []);
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
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname', width: 100 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 150 },
    { title: '评论内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '文章',
      dataIndex: 'article',
      key: 'article',
      width: 150,
      render: (article: { id: number; title: string }) => article?.title || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '已审核' : '待审核'}
        </Tag>
      ),
    },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 150 },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: Comment) => (
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>评论管理</h2>
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
        }}
      />
    </div>
  );
}
