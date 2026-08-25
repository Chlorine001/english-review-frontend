<template>
  <div class="min-h-screen flex items-start pt-24 justify-center bg-gray-50 dark:bg-[#1a1b2e]">
    <div class="w-full max-w-md p-8 card">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">登录</h2>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
          <input v-model="email" type="email" required class="input-field" />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
          <input v-model="password" type="password" required class="input-field" />
        </div>
        <button type="submit" class="w-full btn-primary">登录</button>
      </form>

      <p class="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        还没有账号？<router-link to="/register" class="text-indigo-600 dark:text-indigo-400 underline">注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  try {
    const res = await api.login(email.value, password.value);
    localStorage.setItem('token', res.token);
    router.push('/');
  } catch (e: any) {
    let msg = e.message || '登录失败，请检查网络';
    if (msg.includes('too_small') || msg.includes('密码')) {
      msg = '用户名或密码错误！';
    }
    errorMessage.value = msg;
  }
}
</script>