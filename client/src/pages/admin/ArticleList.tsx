import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getArticles, deleteArticle, toggleArticleTop } from '../../api';

interface Article {
  id: number;
  title: string;
  cover: string;
  view_count: number;
  is_top: number;
  status: number;
  created_at: string;
  category?: { id: number; name: string };
  tags?: { id: number; name: string }[];
}

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, [page]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await getArticles({ page, pageSize: 10 });
      setArticles(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id);
      message.success('删除成功');
      loadArticles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggleTop = async (id: number, isTop: boolean) => {
    try {
      await toggleArticleTop(id, isTop);
      message.success(isTop ? '已置顶' : '已取消置顶');
      loadArticles();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: { id: number; name: string }) => (
        category ? <Tag color="blue">{category.name}</Tag> : '-'
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: { id: number; name: string }[]) => (
        tags?.map((tag) => <Tag key={tag.id}>{tag.name}</Tag>)
      ),
    },
    { title: '浏览', dataIndex: 'view_count', key: 'view_count', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '置顶',
      dataIndex: 'is_top',
      key: 'is_top',
      render: (isTop: number, record: Article) => (
        <Popconfirm
          title={isTop ? '取消置顶？' : '确认置顶？'}
          onConfirm={() => handleToggleTop(record.id, !isTop)}
        >
          <Button size="small" type={isTop ? 'primary' : 'default'}>
            {isTop ? '已置顶' : '置顶'}
          </Button>
        </Popconfirm>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Article) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/articles/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>文章管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/articles/edit')}>
          新增文章
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={articles}
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
