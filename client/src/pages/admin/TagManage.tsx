import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getTags, addTag, updateTag, deleteTag } from '../../api';

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export default function TagManage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    try {
      const res = await getTags();
      setTags(res.data || []);
    } catch (error) {
      console.error('加载标签失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    form.setFieldsValue(tag);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTag(id);
      message.success('删除成功');
      loadTags();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTag) {
        await updateTag(editingTag.id, values);
        message.success('更新成功');
      } else {
        await addTag(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      loadTags();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '标签名称', dataIndex: 'name', key: 'name' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Tag) => (
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
        <h2>标签管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增标签
        </Button>
      </div>

      <Table columns={columns} dataSource={tags} rowKey="id" loading={loading} />

      <Modal
        title={editingTag ? '编辑标签' : '新增标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="标签名称" rules={[{ required: true, message: '请输入标签名称' }]}>
            <Input placeholder="请输入标签名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
