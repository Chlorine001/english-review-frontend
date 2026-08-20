<template>
    <div class="max-w-2xl mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">📚 LexiScribe</h1>
            <button @click="logout" class="btn-danger">退出登录</button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="card p-4 text-center">
                <div class="text-2xl font-bold text-gray-800 dark:text-white"><a href="/review">{{ stats.today }}</a>
                </div>
                <div class="card-meta">今日复习</div>
            </div>
            <div class="card p-4 text-center">
                <div class="text-2xl font-bold text-gray-800 dark:text-white"><a href="/library">{{ stats.total }}</a>
                </div>
                <div class="card-meta">总句子</div>
            </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
            <router-link to="/review" class="btn-primary">🚀 开始复习</router-link>
            <router-link to="/add" class="btn-secondary">➕ 添加句子</router-link>
            <!-- <router-link to="/library" class="btn-secondary">📖 句子库</router-link> -->
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