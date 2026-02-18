import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getFriendLinks, addFriendLink, updateFriendLink, deleteFriendLink, uploadImage } from '../../api';

interface FriendLink {
  id: number;
  name: string;
  link_url: string;
  logo_url: string;
  description: string;
  created_at: string;
}

export default function FriendLinkManage() {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState<FriendLink | null>(null);
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await getFriendLinks();
      setLinks(res.data || []);
    } catch (error) {
      console.error('加载友链失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLink(null);
    setLogoUrl('');
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (link: FriendLink) => {
    setEditingLink(link);
    setLogoUrl(link.logo_url || '');
    form.setFieldsValue(link);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFriendLink(id);
      message.success('删除成功');
      loadLinks();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const res = await uploadImage(file);
      setLogoUrl(res.data.url);
      return false;
    } catch (error) {
      message.error('上传失败');
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = { ...values, logo_url: logoUrl };
      
      if (editingLink) {
        await updateFriendLink(editingLink.id, data);
        message.success('更新成功');
      } else {
        await addFriendLink(data);
        message.success('添加成功');
      }
      setModalVisible(false);
      loadLinks();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '链接', dataIndex: 'link_url', key: 'link_url', ellipsis: true },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FriendLink) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
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
        <h2>友链管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增友链
        </Button>
      </div>

      <Table columns={columns} dataSource={links} rowKey="id" loading={loading} />

      <Modal
        title={editingLink ? '编辑友链' : '新增友链'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="link_url" label="链接" rules={[{ required: true, message: '请输入链接' }]}>
            <Input placeholder="请输入链接URL" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item label="Logo">
            {logoUrl && (
              <img src={logoUrl} alt="logo" style={{ maxWidth: 100, marginBottom: 8 }} />
            )}
            <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
              <Button icon={<PlusOutlined />}>上传Logo</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
