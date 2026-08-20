const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    let errorMessage = '请求失败，请稍后重试';
    try {
        const errorData = await res.json();
        // 如果后端返回了 error.message，取它
        if (errorData.error) {
        if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
        } else if (typeof errorData.error === 'object' && errorData.error.message) {
            errorMessage = errorData.error.message;
        } else if (errorData.message) {
            errorMessage = errorData.message;
        }
        }
    } catch {
        // 如果响应不是 JSON，忽略
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
};