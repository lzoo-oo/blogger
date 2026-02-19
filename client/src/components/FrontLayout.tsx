import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getCategories, getSettings, getCurrentUser } from '@/api';

interface CategoryItem {
  id: number;
  name: string;
}

interface Settings {
  nickname: string;
  avatar: string;
  email: string;
}

interface FrontUser {
  id: number;
  username: string;
  role: string;
  status: number;
}

const FrontLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentUser, setCurrentUser] = useState<FrontUser | null>(null);

  const loadCurrentUser = async () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setCurrentUser(null);
      return;
    }

    try {
      const res: any = await getCurrentUser();
      setCurrentUser(res?.data || null);
    } catch {
      localStorage.removeItem('user_token');
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    Promise.all([getCategories(), getSettings()]).then(([cateRes, settingRes]: any[]) => {
      if (cateRes?.code === 200) {
        setCategories(cateRes.data || []);
      }
      if (settingRes?.code === 200) {
        setSettings(settingRes.data || null);
      }
    });
    loadCurrentUser();
  }, []);

  useEffect(() => {
    const sync = () => {
      loadCurrentUser();
    };
    window.addEventListener('user-auth-change', sync as EventListener);
    return () => window.removeEventListener('user-auth-change', sync as EventListener);
  }, []);

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    if (!keyword) return;
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleUserLogout = () => {
    localStorage.removeItem('user_token');
    window.dispatchEvent(new Event('user-auth-change'));
  };

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/links', label: '友链' }
  ];

  const isGuest = !currentUser;
  const identityText = isGuest
    ? '游客模式'
    : `${currentUser.username}${currentUser.status === 1 ? '' : '（已禁用）'}`;

  return (
    <div className="front-shell">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <header className="front-header glass-panel">
        <Link to="/" className="brand-wrap">
          <span className="brand-dot" />
          <div>
            <h1>{settings?.nickname || '我的博客'}</h1>
            <p>记录文章、思考与创作</p>
          </div>
        </Link>

        <nav className="front-nav">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active' : ''}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-right">
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

          <div className={`user-entry ${isGuest ? 'guest' : 'real'}`} title={identityText}>
            <span className="user-dot" />
            <span className="user-name">{identityText}</span>
          </div>

          {isGuest ? (
            <div className="auth-link-group">
              <Link
                to={`/user/login?from=${encodeURIComponent(location.pathname + location.search)}`}
                className="auth-link-btn primary"
              >
                登录
              </Link>
              <Link
                to={`/user/register?from=${encodeURIComponent(location.pathname + location.search)}`}
                className="auth-link-secondary"
              >
                注册
              </Link>
            </div>
          ) : (
            <button className="auth-link-btn" onClick={handleUserLogout}>
              退出
            </button>
          )}
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
            <p>{settings?.email || '暂无邮箱'}</p>
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
