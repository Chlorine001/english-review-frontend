<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-[#1a1b2e] transition-colors duration-300">
    <!-- 顶部导航栏（包含切换按钮） -->
    <header
      class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#3d3f5e] bg-white dark:bg-[#2d2f44]">
      <div class="text-lg font-semibold text-gray-800 dark:text-white"><a href="/">📚 英语复习</a></div>
      <button @click="toggleDarkMode"
        class="px-3 py-1 rounded border border-gray-300 dark:border-[#5a5d7a] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3d3f5e] transition-colors">
        {{ isDark ? '☀️ 浅色' : '🌙 深色' }}
      </button>
    </header>

    <!-- 页面主体 -->
    <main class="p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

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