import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, message } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  TagsOutlined,
  MessageOutlined,
  LinkOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getSettings } from '@/api';

const { Header, Sider, Content } = Layout;

interface Settings {
  nickname: string;
  avatar: string;
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    getSettings().then((res: any) => {
      if (res.code === 200) {
        setSettings(res.data);
      }
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    message.success('退出成功');
    navigate('/admin/login');
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/admin/articles', icon: <FileTextOutlined />, label: '文章管理' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: '分类管理' },
    { key: '/admin/tags', icon: <TagsOutlined />, label: '标签管理' },
    { key: '/admin/comments', icon: <MessageOutlined />, label: '评论管理' },
    { key: '/admin/links', icon: <LinkOutlined />, label: '友链管理' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: '系统设置' }
  ];

  const userMenuItems = [
    { key: 'home', label: '访问前台', onClick: () => window.open('/', '_blank') },
    { key: 'logout', label: '退出登录', onClick: handleLogout, icon: <LogoutOutlined /> }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: 18 }}>博客后台</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.key)
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 20px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={settings?.avatar}
                icon={!settings?.avatar && <UserOutlined />}
                style={{ marginRight: 8 }}
              />
              <span>{settings?.nickname || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px', padding: 24, background: '#fff', borderRadius: 8, minHeight: 'calc(100vh - 64px - 32px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
