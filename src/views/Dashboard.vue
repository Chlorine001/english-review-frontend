<template>
    <div class="max-w-2xl mx-auto p-4 pb-32 overflow-y-auto h-screen">
        <!-- ====== 欢迎弹窗 ====== -->
        <div v-if="showWelcome"
            class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-24 overflow-y-auto h-screen">
            <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
                <!-- 装饰小元素（可选） -->
                <div
                    class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full opacity-50">
                </div>
                <div class="relative">
                    <div class="text-center">
                        <div class="text-5xl mb-3">✒️</div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">欢迎来到 LexiScribe</h2>
                        <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm leading-relaxed">
                            你的个人英语句子记忆助手。<br>
                            保存你喜欢的好句子，系统会自动安排复习，<br>
                            让它们在你快要忘记的时候再次出现。
                        </p>
                    </div>

                    <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm">
                        <div class="rgb(210 210 211) dark:bg-gray-700/50 rounded-lg p-3">
                            <div class="text-2xl">📝</div>
                            <div class="font-medium text-gray-800 dark:text-white mt-1">记录</div>
                            <div class="text-gray-500 dark:text-gray-400 text-xs">保存喜欢的句子</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div class="text-2xl">🔄</div>
                            <div class="font-medium text-gray-800 dark:text-white mt-1">复习</div>
                            <div class="text-gray-500 dark:text-gray-400 text-xs">智能间隔重复</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div class="text-2xl">🎯</div>
                            <div class="font-medium text-gray-800 dark:text-white mt-1">掌握</div>
                            <div class="text-gray-500 dark:text-gray-400 text-xs">形成个人语料库</div>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-center">
                        <button @click="closeWelcome"
                            class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                            开始使用 🚀
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
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
            <router-link to="/library" class="btn-secondary">📖 句子库</router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const title = import.meta.env.VITE_HOME_TITLE || '📚 LexiScribe';

const router = useRouter();
const stats = ref({ today: 0, total: 0 });
async function loadStats() {
    try {
        stats.value = await api.getStats();
    } catch (e) {
        router.push('/login');
    }
}

const showWelcome = ref(false);

function closeWelcome() {
    showWelcome.value = false;
    localStorage.setItem('lexiscribe_welcome_shown', 'true');
}

onMounted(() => {
    loadStats();
    // 检查是否已显示过欢迎弹窗
    const hasShown = localStorage.getItem('lexiscribe_welcome_shown');
    if (!hasShown) {
        showWelcome.value = true;
    }
});
</script>