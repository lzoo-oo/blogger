import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res: any = await login(values);
      const token = res?.data?.token;
      if (token) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('username', values.username);
        window.dispatchEvent(new Event('admin-auth-change'));
        message.success('登录成功');
        navigate('/admin');
      } else {
        message.error(res?.message || '登录失败');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <Card className="admin-login-card">
        <h2>博客后台管理</h2>
        <p>默认账户：admin / admin123</p>
        <Form name="login" onFinish={onFinish} autoComplete="off" size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
