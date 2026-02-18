import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Input } from 'antd';
import { HomeOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getCategories, getSettings } from '@/api';

const { Header, Content, Sider } = Layout;

interface CategoryItem {
  id: number;
  name: string;
}

interface Settings {
  nickname: string;
  avatar: string;
  email: string;
}

const FrontLayout = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    getCategories().then((res: any) => {
      if (res.code === 200) {
        setCategories(res.data);
      }
    });
    getSettings().then((res: any) => {
      if (res.code === 200) {
        setSettings(res.data);
      }
    });
  }, []);

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(searchKeyword)}`;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 50px', display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', marginRight: 'auto' }}>
          {settings?.nickname || '个人博客'}
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={[
            { key: '/', label: <Link to="/">首页</Link>, icon: <HomeOutlined /> },
            { key: '/links', label: <Link to="/links">友链</Link>, icon: <LinkOutlined /> }
          ]}
        />
        <Input.Search
          placeholder="搜索文章"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 200, marginLeft: 20 }}
          enterButton={<SearchOutlined />}
        />
      </Header>
      <Layout>
        <Sider width={250} style={{ background: '#fff', padding: '20px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ textAlign: 'center' }}>
              {settings?.avatar && (
                <img
                  src={settings.avatar}
                  alt="avatar"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <h3 style={{ marginTop: 10 }}>{settings?.nickname || '博主'}</h3>
              <p style={{ color: '#666', fontSize: 14 }}>{settings?.email}</p>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 5 }}>分类</h4>
            <Menu
              mode="inline"
              items={categories.map((cat) => ({
                key: `/category/${cat.id}`,
                label: <Link to={`/category/${cat.id}`}>{cat.name}</Link>
              }))}
              selectedKeys={[location.pathname]}
            />
          </div>
        </Sider>
        <Content style={{ padding: '20px', background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default FrontLayout;
