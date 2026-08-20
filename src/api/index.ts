const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  // ✅ 新增：处理 401 未授权（Token 过期或无效）
  if (res.status === 401) {
    // 清除本地 Token
    localStorage.removeItem('token');
    // 如果当前不在登录页或注册页，弹窗并跳转
    const { pathname } = window.location;
    if (pathname !== '/login' && pathname !== '/register') {
      alert('登录已过期，请重新登录');  // 弹窗提示
      window.location.href = '/login';
    }
    // 抛出错误，让调用方知道请求失败
    throw new Error('登录已过期，请重新登录');
  }

  if (!res.ok) {
    // 尝试解析错误消息
    let errorMessage = '请求失败，请稍后重试';
    try {
      const errData = await res.json();
      if (errData.error) {
        // 如果后端返回的是字符串或对象
        errorMessage = typeof errData.error === 'string' ? errData.error : errData.error.message || errorMessage;
      } else if (errData.message) {
        errorMessage = errData.message;
      }
    } catch {
      // 无法解析 JSON，使用默认消息
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const api = {
  // 认证
  register: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // 句子
  addSentence: (data: { content: string; translation?: string; pronunciation?: string; notes?: string; source?: string }) =>
    request<{ id: number }>('/sentences', { method: 'POST', body: JSON.stringify(data) }),

  // 复习
  getTodayReviews: () => request<any[]>('/reviews/today'),
  submitAnswer: (reviewId: number, rating: string) =>
    request<{ success: boolean }>(`/reviews/${reviewId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),

  // 统计
  getStats: () => request<{ today: number; total: number }>('/stats'),


  // 新增：获取所有句子
  getSentences: (params?: { search?: string; sort?: string }) =>
    request<any[]>('/sentences' + (params ? '?' + new URLSearchParams(params) : '')),

  // 新增：更新句子
  updateSentence: (id: number, data: any) =>
    request<{ success: boolean }>(`/sentences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 新增：删除句子
  deleteSentence: (id: number) =>
    request<{ success: boolean }>(`/sentences/${id}`, {
      method: 'DELETE',
    }),
};

