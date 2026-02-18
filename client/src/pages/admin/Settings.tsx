import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Upload, Avatar } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { getSettings, updateSettings, uploadImage } from '../../api';

interface Settings {
  nickname: string;
  avatar: string;
  email: string;
}

export default function Settings() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getSettings();
      const settings = res.data || {};
      form.setFieldsValue(settings);
      setAvatar(settings.avatar || '');
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const res = await uploadImage(file);
      setAvatar(res.data.url);
      return false;
    } catch (error) {
      message.error('上传失败');
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await updateSettings({ ...values, avatar });
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统设置</h2>
      <Card style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="头像">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar size={80} src={avatar} icon={<UserOutlined />} />
              <Upload beforeUpload={handleUpload} showUploadList={false} accept="image/*">
                <Button icon={<PlusOutlined />}>上传头像</Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item name="password" label="新密码">
            <Input.Password placeholder="不修改请留空" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
