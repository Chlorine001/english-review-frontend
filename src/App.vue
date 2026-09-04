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
          <!-- 用户下拉菜单 -->
          <div class="relative" ref="menuContainer">
            <button @click="toggleDropdown"
              class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:ring-2 hover:ring-indigo-400 transition focus:outline-none">
              {{ userInitial }}
            </button>
            <!-- 下拉列表 -->
            <div v-if="showDropdown"
              class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              <router-link to="/profile" @click="closeDropdown"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                ⚙️ 设置
              </router-link>
              <button @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                🚪 退出登录
              </button>
            </div>
          </div>
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
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';

const router = useRouter();
const isLoggedIn = ref(false);
const userInitial = ref('');

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
    localStorage.removeItem('userEmail');
    localStorage.removeItem('nickName');
    // localStorage.removeItem('lexiscribe_welcome_shown');
    closeDropdown();
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
      // 如果你有用户信息，可以取昵称首字母，否则用邮箱首字母
      const nickname = localStorage.getItem('nickName');
      if (nickname) {
        // ✅ 使用 Array.from 安全获取第一个字符（支持 Emoji）
        const firstChar = Array.from(nickname)[0] || '?';
        userInitial.value = firstChar.toUpperCase();
      } else {
        const email = localStorage.getItem('userEmail') || 'U';
        userInitial.value = email.charAt(0).toUpperCase();
      }
    }
  },
  { immediate: true }
);


// 下拉菜单状态
const showDropdown = ref(false);
const menuContainer = ref<HTMLElement | null>(null);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function closeDropdown() {
  showDropdown.value = false;
}

// 点击外部关闭下拉菜单
function handleClickOutside(event: MouseEvent) {
  if (menuContainer.value && !menuContainer.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 组件挂载时，从 localStorage 恢复用户选择
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
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