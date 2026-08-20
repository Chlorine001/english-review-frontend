<template>
    <div class="max-w-2xl mx-auto p-4">
        <!-- 头部：标题 + 退出按钮 -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">📚 英语复习</h1>
            <button @click="logout"
                class="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors duration-200">
                退出登录
            </button>
        </div>

        <!-- 统计卡片 -->
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

        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-4">
            <router-link to="/review"
                class="px-6 py-3 bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700 transition-colors">
                🚀 开始复习
            </router-link>
            <router-link to="/add"
                class="px-6 py-3 bg-white border rounded-lg text-center hover:bg-gray-50 transition-colors">
                ➕ 添加句子
            </router-link>
        </div>
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
        router.push('/login');
    }
}

function logout() {
    localStorage.removeItem('token');
    router.push('/login');
}

onMounted(loadStats);
</script>