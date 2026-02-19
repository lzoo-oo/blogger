import axios from 'axios';

const ADMIN_TOKEN_KEY = 'admin_token';
const USER_TOKEN_KEY = 'user_token';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

request.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isAdminEndpoint = url.startsWith('/my/') || url.startsWith('/upload');

    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const userToken = localStorage.getItem(USER_TOKEN_KEY);
    const token = isAdminEndpoint ? adminToken : userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url || '';
      const isAdminEndpoint = url.startsWith('/my/') || url.startsWith('/upload') || window.location.pathname.startsWith('/admin');

      if (isAdminEndpoint) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('admin-auth-change'));
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem(USER_TOKEN_KEY);
        window.dispatchEvent(new Event('user-auth-change'));
      }
    }
    return Promise.reject(error);
  }
);

export default request;
