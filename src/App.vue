<template>
  <div id="app" class="min-h-screen bg-slate-50 dark:bg-[#1a1b2e] transition-colors duration-300">
    <!-- 顶部导航栏（包含切换按钮） -->
    <header
      class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#3d3f5e] bg-white dark:bg-[#2d2f44]">
      <div class="text-lg font-semibold text-gray-800 dark:text-white"><a href="/">{{ appTitle }}</a></div>
      <div v-if="isLoggedIn">
       
        <div class="flex items-center gap-2">
           <button @click="toggleDarkMode"
          class="px-3 py-1 rounded border border-gray-300 dark:border-[#5a5d7a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3d3f5e] transition-colors">
          {{ isDark ? '☀️ 浅色' : '🌙 深色' }}
        </button>
          <router-link to="/profile"
            class="px-3 py-1 rounded border border-gray-300 dark:border-[#5a5d7a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3d3f5e] transition-colors text-sm">
            ⚙️ 设置
          </router-link>
          <button @click="handleLogout"
            class="px-3 py-1 rounded border border-gray-300 dark:border-[#5a5d7a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3d3f5e] transition-colors text-sm">
            退出
          </button>
        </div>
      </div>
      <div v-else>
        <button @click="toggleDarkMode"
          class="px-3 py-1 rounded border border-gray-300 dark:border-[#5a5d7a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3d3f5e] transition-colors">
          {{ isDark ? '☀️ 浅色' : '🌙 深色' }}
        </button>
      </div>
    </header>

    <!-- 页面主体 -->
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';

const router = useRouter();
const isLoggedIn = ref(false);

// ---------- 从环境变量读取应用标题 ----------
const appTitle = import.meta.env.VITE_APP_TITLE || '📚 LexiScribe · 智能英语精炼';

// 从 localStorage 读取用户偏好，如果没有则默认为 false（浅色）
const isDark = ref(false);

function toggleDarkMode() {
  isDark.value = !isDark.value;
  updateDarkClass();
  localStorage.setItem('darkMode', String(isDark.value));
}

function updateDarkClass() {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// 退出登录
async function handleLogout() {
  try {
    await api.logout();
  } catch (err) {
    console.error('登出失败', err);
    // 即使后端报错，也可以清除本地状态，让用户重新登录
  } finally {
    // 清除本地登录标志
    localStorage.removeItem('isLoggedIn');
    // localStorage.removeItem('lexiscribe_welcome_shown');

    // 跳转到登录页
    router.push('/login');
    alert('退出登录成功！');
  }
}

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    const publicPaths = ['/login', '/register', '/verify-email'];
    if (publicPaths.includes(newPath)) {
      isLoggedIn.value = false;
    } else {
      // 只在非公共页面检查
      isLoggedIn.value = localStorage.getItem('isLoggedIn') === 'true';
    }
  },
  { immediate: true }
);

// 组件挂载时，从 localStorage 恢复用户选择
onMounted(() => {
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true') {
    isDark.value = true;
  } else if (saved === 'false') {
    isDark.value = false;
  } else {
    // 如果用户从未设置过，可以用系统偏好作为默认值（可选）
    // 这里简单起见，默认浅色
    isDark.value = false;
  }
  updateDarkClass();
});


</script>