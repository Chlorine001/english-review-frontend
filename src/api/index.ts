import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = baseURL + '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

async function request<T>(endpoint: string, options: RequestInit = {}, skipAuthRedirect: boolean = false): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // 关键：携带 Cookie
    headers,
  });

  // ✅ 新增：处理 401 未授权（Token 过期或无效）
  if (res.status === 401) {
    // 使用更优雅的提示方式（如 Toast 或 Notification）
    // 如果你的项目有 UI 库，改用 notification.error()
    if (!skipAuthRedirect) {
      console.warn('登录已过期，请重新登录');
      // window.location.href = '/login';
      throw new Error('登录已过期，请重新登录');
    }
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
    }, true),
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true),
  logout: () => request('/auth/logout', { method: 'POST' }),

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

  // 获取音频的预签名 URL
  getAudioUrl: (sentenceId: number) =>
    request<{ url: string }>(`/sentences/${sentenceId}/audio-url`),

  // // 上传音频（用 FormData，支持进度）
  // uploadAudio: (sentenceId: number, file: File, onProgress?: (percent: number) => void) => {
  //   const formData = new FormData();
  //   formData.append('audio', file);
  //   return new Promise<{ success: boolean; key: string }>((resolve, reject) => {
  //     const xhr = new XMLHttpRequest();
  //     xhr.withCredentials = true;
  //     xhr.open('POST', `/api/sentences/${sentenceId}/audio`);
  //     xhr.upload.addEventListener('progress', (e) => {
  //       if (e.lengthComputable && onProgress) {
  //         onProgress(Math.round((e.loaded / e.total) * 100));
  //       }
  //     });
  //     xhr.onload = () => {
  //       if (xhr.status === 200) {
  //         resolve(JSON.parse(xhr.responseText));
  //       } else {
  //         reject(new Error(xhr.statusText || '上传失败'));
  //       }
  //     };
  //     xhr.onerror = () => reject(new Error('网络错误'));
  //     xhr.send(formData);
  //   });
  // },

  uploadAudio: (sentenceId: number, file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('audio', file);

    return axiosInstance.post(`/sentences/${sentenceId}/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    }).then(res => res.data);
  },

};


