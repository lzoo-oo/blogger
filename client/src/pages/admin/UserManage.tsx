import { useEffect, useState } from 'react';
import { Table, Input, Select, Space, Button, Tag, Popconfirm, Modal, Form, message } from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { getUsers, updateUser, deleteUser } from '@/api';

interface UserRow {
  id: number;
  username: string;
  role: string;
  status: number;
  created_at: string;
  comment_count: number;
}

export default function UserManage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [passwordModal, setPasswordModal] = useState<{ open: boolean; userId?: number; username?: string }>({ open: false });
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, [page, status]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res: any = await getUsers({
        page,
        pageSize: 10,
        keyword: keyword.trim() || undefined,
        status
      });
      setUsers(res?.data?.list || []);
      setTotal(res?.data?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (record: UserRow) => {
    const next = record.status === 1 ? 0 : 1;
    await updateUser(record.id, { status: next });
    message.success(next === 1 ? '已启用' : '已禁用');
    loadUsers();
  };

  const handleDelete = async (id: number) => {
    await deleteUser(id);
    message.success('已删除用户');
    loadUsers();
  };

  const handleResetPassword = async () => {
    const values = await form.validateFields();
    if (!passwordModal.userId) return;

    await updateUser(passwordModal.userId, { password: values.password });
    message.success('密码重置成功');
    setPasswordModal({ open: false });
    form.resetFields();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '账号', dataIndex: 'username', key: 'username' },
    {
      title: '身份',
      dataIndex: 'role',
      key: 'role',
      render: () => <Tag color="blue">真实用户</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: number) =>
        value === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>
    },
    { title: '评论数', dataIndex: 'comment_count', key: 'comment_count', width: 90 },
    { title: '注册时间', dataIndex: 'created_at', key: 'created_at', width: 190 },
    {
      title: '操作',
      key: 'actions',
      width: 300,
      render: (_: unknown, record: UserRow) => (
        <Space wrap>
          <Button size="small" onClick={() => handleToggleStatus(record)}>
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
          <Button
            size="small"
            onClick={() => {
              setPasswordModal({ open: true, userId: record.id, username: record.username });
            }}
          >
            重置密码
          </Button>
          <Popconfirm title="确认删除该用户及其评论？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>用户管理</h2>
        <Space>
          <Input.Search
            placeholder="按账号搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={() => {
              setPage(1);
              loadUsers();
            }}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            allowClear
            value={status}
            onChange={(v) => {
              setPage(1);
              setStatus(v);
            }}
            placeholder="状态"
            style={{ width: 100 }}
            options={[
              { value: 1, label: '启用' },
              { value: 0, label: '禁用' }
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={loadUsers}>
            刷新
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={users}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage
        }}
      />

      <Modal
        title={`重置密码 - ${passwordModal.username || ''}`}
        open={passwordModal.open}
        onOk={handleResetPassword}
        onCancel={() => {
          setPasswordModal({ open: false });
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="password" label="新密码" rules={[{ required: true, min: 6, message: '至少 6 位' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
