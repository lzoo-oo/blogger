import request from './request';

// 登录
export const login = (data: { username: string; password: string }) =>
  request.post('/login', data);

// 文章
export const getArticles = (params: {
  page?: number;
  pageSize?: number;
  cate_id?: number;
  keyword?: string;
  status?: number;
}) => request.get('/articles', { params });

export const getArticleDetail = (id: number) => request.get(`/articles/${id}`);
export const getArticleById = getArticleDetail;

export const addArticle = (data: any) =>
  request.post('/my/articles/add', {
    ...data,
    cover_img: data.cover_img ?? data.cover ?? '',
    tag_ids: data.tag_ids ?? data.tagIds ?? []
  });

export const updateArticle = (id: number, data: any) =>
  request.put(`/my/articles/${id}`, {
    ...data,
    cover_img: data.cover_img ?? data.cover ?? '',
    tag_ids: data.tag_ids ?? data.tagIds ?? []
  });

export const deleteArticle = (id: number) => request.delete(`/my/articles/${id}`);

export const toggleArticleTop = (id: number, is_top: boolean) =>
  request.put(`/my/articles/${id}/top`, { is_top });

// 分类
export const getCategories = () => request.get('/categories');
export const getCategoryById = (id: number) => request.get(`/categories/${id}`);
export const addCategory = (data: { name: string; alias?: string }) => request.post('/my/categories', data);
export const updateCategory = (id: number, data: { name?: string; alias?: string }) =>
  request.put(`/my/categories/${id}`, data);
export const deleteCategory = (id: number) => request.delete(`/my/categories/${id}`);

// 标签
export const getTags = () => request.get('/tags');
export const addTag = (data: { name: string }) => request.post('/my/tags', data);
export const updateTag = (id: number, data: { name?: string }) => request.put(`/my/tags/${id}`, data);
export const deleteTag = (id: number) => request.delete(`/my/tags/${id}`);

// 评论
export const getComments = (params: { page?: number; pageSize?: number }) =>
  request.get('/my/comments', { params });

export const getArticleComments = (articleId: number) => request.get(`/comments/article/${articleId}`);

export const createComment = (data: {
  nickname: string;
  email?: string;
  content: string;
  article_id: number;
  parent_id?: number;
}) => request.post('/comments/add', data);

export const addComment = createComment;

export const deleteComment = (id: number) => request.delete(`/my/comments/${id}`);

export const replyComment = (data: { article_id: number; parent_id?: number; content: string }) =>
  request.post('/my/comments/reply', data);

// 友链
export const getFriendLinks = () => request.get('/friendlinks');
export const addFriendLink = (data: { name: string; link_url: string; logo_url?: string; description?: string }) =>
  request.post('/my/friendlinks', data);
export const updateFriendLink = (
  id: number,
  data: { name?: string; link_url?: string; logo_url?: string; description?: string }
) => request.put(`/my/friendlinks/${id}`, data);
export const deleteFriendLink = (id: number) => request.delete(`/my/friendlinks/${id}`);

// 上传
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// 设置
export const getSettings = () => request.get('/settings');
export const updateSettings = (data: { nickname?: string; avatar?: string; email?: string; password?: string }) =>
  request.put('/my/settings', data);

// 仪表盘
export const getDashboardStats = () => request.get('/my/dashboard/stats');
