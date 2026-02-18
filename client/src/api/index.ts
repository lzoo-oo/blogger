import request from './request';

// 登录
export const login = (data: { username: string; password: string }) =>
  request.post<any, any>('/login', data);

// 获取文章列表
export const getArticles = (params: {
  page?: number;
  pageSize?: number;
  cate_id?: number;
  keyword?: string;
  status?: number;
}) => request.get('/articles', { params });

// 获取文章详情
export const getArticleDetail = (id: number) =>
  request.get(`/articles/${id}`);

// 获取文章详情（别名）
export const getArticleById = getArticleDetail;

// 新增文章
export const addArticle = (data: any) =>
  request.post('/my/articles/add', data);

// 编辑文章
export const updateArticle = (id: number, data: any) =>
  request.put(`/my/articles/${id}`, data);

// 删除文章
export const deleteArticle = (id: number) =>
  request.delete(`/my/articles/${id}`);

// 置顶文章
export const toggleArticleTop = (id: number, is_top: boolean) =>
  request.put(`/my/articles/${id}/top`, { is_top });

// 获取分类列表
export const getCategories = () => request.get('/categories');

// 获取分类详情
export const getCategoryById = (id: number) =>
  request.get(`/categories/${id}`);

// 新增分类
export const addCategory = (data: { name: string; alias?: string }) =>
  request.post('/my/categories', data);

// 编辑分类
export const updateCategory = (id: number, data: { name?: string; alias?: string }) =>
  request.put(`/my/categories/${id}`, data);

// 删除分类
export const deleteCategory = (id: number) =>
  request.delete(`/my/categories/${id}`);

// 获取标签列表
export const getTags = () => request.get('/tags');

// 新增标签
export const addTag = (data: { name: string }) =>
  request.post('/my/tags', data);

// 编辑标签
export const updateTag = (id: number, data: { name?: string }) =>
  request.put(`/my/tags/${id}`, data);

// 删除标签
export const deleteTag = (id: number) =>
  request.delete(`/my/tags/${id}`);

// 获取评论列表
export const getComments = (params: { page?: number; pageSize?: number; article_id?: number }) =>
  request.get('/comments', { params });

// 获取文章评论
export const getArticleComments = (articleId: number) =>
  request.get(`/comments/article/${articleId}`);

// 发表评论（前台）
export const createComment = (data: {
  nickname: string;
  email?: string;
  content: string;
  article_id: number;
  parent_id?: number;
}) => request.post('/comments', data);

// 发表评论（别名）
export const addComment = createComment;

// 删除评论
export const deleteComment = (id: number) =>
  request.delete(`/my/comments/${id}`);

// 回复评论
export const replyComment = (data: {
  article_id: number;
  parent_id?: number;
  content: string;
}) => request.post('/my/comments/reply', data);

// 获取友链列表
export const getFriendLinks = () => request.get('/friendlinks');

// 新增友链
export const addFriendLink = (data: { name: string; link_url: string; logo_url?: string }) =>
  request.post('/my/friendlinks', data);

// 编辑友链
export const updateFriendLink = (id: number, data: { name?: string; link_url?: string; logo_url?: string }) =>
  request.put(`/my/friendlinks/${id}`, data);

// 删除友链
export const deleteFriendLink = (id: number) =>
  request.delete(`/my/friendlinks/${id}`);

// 上传图片
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 获取博主信息
export const getSettings = () => request.get('/settings');

// 更新博主信息
export const updateSettings = (data: { nickname?: string; avatar?: string; email?: string; password?: string }) =>
  request.put('/my/settings', data);

// 获取仪表盘统计
export const getDashboardStats = () => request.get('/my/dashboard/stats');
