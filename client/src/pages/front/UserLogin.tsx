import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser } from '@/api';

export default function UserLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res: any = await loginUser(values);
      const token = res?.data?.token;
      if (!token) {
        message.error(res?.message || '登录失败');
        return;
      }

      localStorage.setItem('user_token', token);
      window.dispatchEvent(new Event('user-auth-change'));
      message.success('登录成功');

      const from = new URLSearchParams(location.search).get('from');
      navigate(from || '/');
    } catch (error: any) {
      message.error(error?.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel section-panel user-auth-page">
      <div className="user-auth-heading">
        <h2>欢迎回来</h2>
        <p>登录后即可评论、管理个人互动记录。</p>
      </div>
      <Card className="user-auth-card" title="用户登录">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="账号" rules={[{ required: true, message: '请输入账号' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入账号" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <p className="auth-helper">
          还没有账号？<Link to="/user/register">去注册</Link>
        </p>
      </Card>
    </div>
  );
}
