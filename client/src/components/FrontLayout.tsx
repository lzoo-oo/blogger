import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getCategories, getSettings } from '@/api';

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
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    Promise.all([getCategories(), getSettings()]).then(([cateRes, settingRes]: any[]) => {
      if (cateRes?.code === 200) {
        setCategories(cateRes.data || []);
      }
      if (settingRes?.code === 200) {
        setSettings(settingRes.data || null);
      }
    });
  }, []);

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    if (!keyword) return;
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/links', label: '友链' }
  ];

  return (
    <div className="front-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <header className="front-header glass-panel">
        <Link to="/" className="brand-wrap">
          <span className="brand-dot" />
          <div>
            <h1>{settings?.nickname || 'Lyoolio Blog'}</h1>
            <p>Chronicles of ideas, code and aesthetics</p>
          </div>
        </Link>
        <nav className="front-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="front-search">
          <SearchOutlined />
          <input
            placeholder="搜索文章..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
      </header>

      <main className="front-main">
        <aside className="front-aside glass-panel">
          <div className="profile-card">
            {settings?.avatar ? (
              <img src={settings.avatar} alt={settings.nickname || 'avatar'} />
            ) : (
              <div className="avatar-fallback">{(settings?.nickname || 'B').slice(0, 1).toUpperCase()}</div>
            )}
            <h3>{settings?.nickname || '博主'}</h3>
            <p>{settings?.email || 'hello@blog.dev'}</p>
          </div>

          <section className="category-card">
            <div className="panel-title">文章分类</div>
            <div className="category-list">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className={location.pathname === `/category/${category.id}` ? 'active' : ''}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <section className="front-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default FrontLayout;
