<template>
  <div class="min-h-screen flex items-start p-4 pt-20 justify-center bg-gray-50 dark:bg-[#1a1b2e]">
    <div class="w-full max-w-md p-8 card">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">登录</h2>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
          <input v-model="email" type="email" required class="input-field" autocomplete="username" />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
          <input v-model="password" type="password" required class="input-field" autocomplete="current-password" />
        </div>
        <button type="submit" class="w-full btn-primary" :disabled="islogging">{{ islogging ? '登录中...' : '登录'
        }}</button>
      </form>

      <p class="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        还没有账号？<router-link to="/register" class="text-indigo-600 dark:text-indigo-400 underline">注册</router-link>
      </p>
    </div>
  </div>
  <!-- 右下角后端状态指示器 -->
  <div
    class="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700/80 transition"
    @click="checkBackendHealth">
    <span class="w-2.5 h-2.5 rounded-full" :class="{
      'bg-green-500': backendStatus === 'online',
      'bg-red-500': backendStatus === 'offline',
      'bg-yellow-500 animate-pulse': backendStatus === 'checking',
    }"></span>
    <span class="text-gray-700 dark:text-gray-300">{{ statusText }}</span>
  </div>

  <ConfirmDialog ref="confirmDialog" title="邮箱尚未验证" message="您注册的邮箱还未验证，是否前往验证页面？" icon="📧" confirm-text="前往验证"
    cancel-text="稍后再说" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../../api';
import { confirm } from '@/utils/verifyCheck';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const islogging = ref(false);

// 后端状态
const backendStatus = ref<'checking' | 'online' | 'offline'>('checking');

const statusText = computed(() => {
  switch (backendStatus.value) {
    case 'online': return '后端服务正常';
    case 'offline': return '后端服务不可用';
    default: return '检测中…';
  }
});

async function handleLogin() {
  errorMessage.value = '';
  try {
    islogging.value = true;
    const res = await api.login(email.value, password.value);
    localStorage.setItem('isLoggedIn', 'true');
    if (res.user.nickname) {
      localStorage.setItem('nickName', res.user.nickname);
    }
    localStorage.setItem('userEmail', email.value);
    localStorage.setItem('isVerified', String(res.user.is_verified));

    if (!res.user.is_verified) {
      // ✅ 类似原生 confirm 的调用方式
      const confirmed = await confirm({
        title: '邮箱尚未验证',
        message: '您注册的邮箱还未验证，是否前往验证页面？',
        icon: '📧',
        confirmText: '前往验证',
        cancelText: '稍后再说',
      });

      if (confirmed) {
        // 用户选择验证 → 跳转验证页面
        errorMessage.value = '⏳ 正在跳转至验证页面...';
        setTimeout(() => {
          router.push({ path: '/verify-email', query: { email: email.value } });
        }, 500);
      } else {
        // 用户选择稍后 → 跳转首页
        errorMessage.value = '🏠 正在跳转至首页...';
        setTimeout(() => {
        router.push('/');
        }, 1000)
      }
      return;
    }
    router.push('/');
  } catch (e: any) {
    // 解析错误信息
    let msg = e.message || '登录失败，请检查网络';
    if (msg.includes('too_small') || msg.includes('密码')) {
      msg = '用户名或密码错误！';
    }
    if (msg.includes('Invalid email address')) {
      msg = '邮箱格式有误！';
    }
    // 其他错误提示
    errorMessage.value = msg;
    islogging.value = false;
  } finally {
    islogging.value = false;
  }
}

// 健康检测
async function checkBackendHealth() {
  try {
    backendStatus.value = 'checking';
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    await fetch(`${baseURL}/`, {
      signal: controller.signal,
      method: 'GET',
      // 允许任何状态码，只要请求能被处理即认为在线
    });
    clearTimeout(timeoutId);

    // 只要服务器有响应（即使 404/401），都视为在线
    backendStatus.value = 'online';
  } catch {
    // 网络错误或超时
    backendStatus.value = 'offline';
  }
}

onMounted(() => {
  checkBackendHealth();
});
</script>