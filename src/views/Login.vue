<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold text-center mb-6">登录</h2>
      <div v-if="errorMessage" class="mb-4 p-2 bg-red-100 text-red-800 rounded">
        {{ errorMessage }}
      </div>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">邮箱</label>
          <input v-model="email" type="email" required class="w-full border rounded px-3 py-2" />
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium mb-1">密码</label>
          <input v-model="password" type="password" required class="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">登录</button>
      </form>
      <p class="mt-4 text-sm text-center">
        还没有账号？<router-link to="/register" class="text-indigo-600 underline">注册</router-link>
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