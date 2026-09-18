import axios from 'axios';
import { router } from '@/router';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = `${baseURL}/api`;

const axiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: true,   // 携带 Cookie
    timeout: 300000,         // 5 分钟（AI 识别可能较慢）
});

// ===== 响应拦截器 =====
axiosInstance.interceptors.response.use(
    // ✅ 成功响应
    (response) => response,

    // ❌ 错误响应
    (error) => {
        if (error.response?.status === 401) {
            // 1. 清除登录状态
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('nickName');
            localStorage.removeItem('isVerified');

            // 2. 避免在登录页重复跳转
            const currentPath = window.location.pathname;
            const publicPaths = ['/login', '/register', '/verify-email'];

            if (!publicPaths.includes(currentPath)) {
                // ✅ 携带来源路径，登录后可跳回
                // const redirect = encodeURIComponent(currentPath + window.location.search);
                router.push(`/login`);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;