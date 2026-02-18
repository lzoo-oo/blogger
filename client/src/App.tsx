import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// 前台页面
import FrontLayout from './components/FrontLayout';
import Home from './pages/front/Home';
import ArticleDetail from './pages/front/ArticleDetail';
import Category from './pages/front/Category';
import Search from './pages/front/Search';
import FriendLinks from './pages/front/FriendLinks';

// 后台页面
import AdminLayout from './components/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ArticleList from './pages/admin/ArticleList';
import ArticleEdit from './pages/admin/ArticleEdit';
import CategoryManage from './pages/admin/CategoryManage';
import TagManage from './pages/admin/TagManage';
import CommentManage from './pages/admin/CommentManage';
import FriendLinkManage from './pages/admin/FriendLinkManage';
import Settings from './pages/admin/Settings';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', syncToken);
    window.addEventListener('auth-change', syncToken as EventListener);
    return () => {
      window.removeEventListener('storage', syncToken);
      window.removeEventListener('auth-change', syncToken as EventListener);
    };
  }, []);

  return (
    <Routes>
      {/* 前台路由 */}
      <Route path="/" element={<FrontLayout />}>
        <Route index element={<Home />} />
        <Route path="article/:id" element={<ArticleDetail />} />
        <Route path="category/:id" element={<Category />} />
        <Route path="search" element={<Search />} />
        <Route path="links" element={<FriendLinks />} />
      </Route>

      {/* 后台登录 */}
      <Route path="/admin/login" element={<Login />} />

      {/* 后台管理 */}
      <Route
        path="/admin"
        element={
          token ? (
            <AdminLayout />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<ArticleList />} />
        <Route path="articles/edit/:id?" element={<ArticleEdit />} />
        <Route path="categories" element={<CategoryManage />} />
        <Route path="tags" element={<TagManage />} />
        <Route path="comments" element={<CommentManage />} />
        <Route path="links" element={<FriendLinkManage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
