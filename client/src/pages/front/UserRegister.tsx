import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser } from '@/api';

export default function UserRegister() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res: any = await registerUser(values);
      const token = res?.data?.token;
      if (!token) {
        message.error(res?.message || '注册失败');
        return;
      }

      localStorage.setItem('user_token', token);
      window.dispatchEvent(new Event('user-auth-change'));
      message.success('注册成功，已自动登录');

      const from = new URLSearchParams(location.search).get('from');
      navigate(from || '/');
    } catch (error: any) {
      message.error(error?.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel section-panel user-auth-page">
      <div className="user-auth-heading">
        <h2>创建真实用户账号</h2>
        <p>未登录即游客，注册后可发表评论并参与互动。</p>
      </div>
      <Card className="user-auth-card" title="用户注册">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="账号" rules={[{ required: true, message: '请输入账号' }, { min: 3, message: '至少 3 位' }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入账号" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '至少 6 位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
        </Form>
        <p className="auth-helper">
          未登录状态即为游客。已有账号？<Link to="/user/login">去登录</Link>
        </p>
      </Card>
    </div>
  );
}
