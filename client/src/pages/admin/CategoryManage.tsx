import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../api';

interface Category {
  id: number;
  name: string;
  alias: string;
  created_at: string;
}

export default function CategoryManage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success('删除成功');
      loadCategories();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        message.success('更新成功');
      } else {
        await addCategory(values);
        message.success('添加成功');
      }
      setModalVisible(false);
      loadCategories();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '分类名称', dataIndex: 'name', key: 'name' },
    { title: '别名', dataIndex: 'alias', key: 'alias' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Category) => (
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
        <h2>分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增分类
        </Button>
      </div>

      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} />

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="alias" label="别名">
            <Input placeholder="请输入别名" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
