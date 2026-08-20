<template>
  <div class="max-w-2xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">📚 英语复习</h1>
    <div class="grid grid-cols-2 gap-4 mb-8">
      <div class="bg-blue-100 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold">{{ stats.today }}</div>
        <div class="text-sm text-gray-600">今日复习</div>
      </div>
      <div class="bg-green-100 p-4 rounded-lg text-center">
        <div class="text-2xl font-bold">{{ stats.total }}</div>
        <div class="text-sm text-gray-600">总句子</div>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-4">
      <router-link to="/review" class="px-6 py-3 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700">
        🚀 开始复习
      </router-link>
      <router-link to="/add" class="px-6 py-3 bg-white border rounded-lg text-center hover:bg-gray-50">
        ➕ 添加句子
      </router-link>
    </div>
    <button @click="logout" class="mt-6 text-sm text-red-600 underline">退出登录</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const stats = ref({ today: 0, total: 0 });

async function loadStats() {
  try {
    stats.value = await api.getStats();
  } catch (e) {
    // token 可能过期，跳登录
    router.push('/login');
  }
}

function logout() {
  localStorage.removeItem('token');
  router.push('/login');
}

onMounted(loadStats);
</script>