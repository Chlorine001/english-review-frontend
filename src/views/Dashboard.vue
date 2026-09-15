<template>
    <div class="max-w-2xl mx-auto p-4">
        <div v-if="!isVerified"
            class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4 text-sm text-yellow-800 dark:text-yellow-300">
            ⚠️ 邮箱未验证，<router-link :to="{ path: '/verify-email', query: { email: userEmail } }"
                class="text-indigo-600 dark:text-indigo-400 underline">点击验证</router-link>
            ，以解锁全部功能（附件上传、邮箱通知等）。
        </div>
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

        <div class="card p-6 mb-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">📊 学习进度</h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    总计 {{ progress.total }} 个句子
                </span>
            </div>

            <!-- 进度条：各状态占比 -->
            <div class="h-3 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-700 mb-3">
                <div class="bg-gray-400 dark:bg-gray-500 transition-all" :style="{ width: percent('NEW') + '%' }"
                    title="新句子"></div>
                <div class="bg-yellow-400 transition-all" :style="{ width: percent('LEARNING') + '%' }" title="学习中">
                </div>
                <div class="bg-blue-500 transition-all" :style="{ width: percent('REVIEW') + '%' }" title="复习中"></div>
                <div class="bg-green-500 transition-all" :style="{ width: percent('MATURE') + '%' }" title="已掌握"></div>
            </div>

            <!-- 图例 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
                <div>
                    <div class="flex items-center justify-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                        <span class="text-gray-600 dark:text-gray-400">新句子</span>
                    </div>
                    <p class="text-lg font-bold text-gray-800 dark:text-white mt-1">
                        {{ progress.byStatus.NEW }}
                    </p>
                </div>
                <div>
                    <div class="flex items-center justify-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                        <span class="text-gray-600 dark:text-gray-400">学习中</span>
                    </div>
                    <p class="text-lg font-bold text-gray-800 dark:text-white mt-1">
                        {{ progress.byStatus.LEARNING }}
                    </p>
                </div>
                <div>
                    <div class="flex items-center justify-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        <span class="text-gray-600 dark:text-gray-400">复习中</span>
                    </div>
                    <p class="text-lg font-bold text-gray-800 dark:text-white mt-1">
                        {{ progress.byStatus.REVIEW }}
                    </p>
                </div>
                <div>
                    <div class="flex items-center justify-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        <span class="text-gray-600 dark:text-gray-400">已掌握</span>
                    </div>
                    <p class="text-lg font-bold text-gray-800 dark:text-white mt-1">
                        {{ progress.byStatus.MATURE }}
                    </p>
                </div>
            </div>
        </div>

        <div class="card p-6 mb-4">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">📅 今日复习</h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ progress.todayDone }} / {{ progress.todayDone + progress.todayPending }}
                </span>
            </div>

            <!-- 进度条 -->
            <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    :style="{ width: todayPercent + '%' }"></div>
            </div>

            <div class="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>已完成 {{ progress.todayDone }}</span>
                <span>待复习 {{ progress.todayPending }}</span>
            </div>
        </div>

        <div class="card p-4 text-center">
            <div class="text-4xl">🔥</div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ progress.streak }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">连续学习天数</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <router-link to="/review"
                class="btn-primary flex items-center justify-center gap-2 py-3 text-sm whitespace-nowrap">
                🚀 开始复习
            </router-link>
            <router-link to="/add"
                class="btn-secondary flex items-center justify-center gap-2 py-3 text-sm whitespace-nowrap">
                ➕ 添加句子
            </router-link>
            <router-link to="/mygroups"
                class="btn-secondary flex items-center justify-center gap-2 py-3 text-sm whitespace-nowrap">
                🏠 我的小组
            </router-link>
            <router-link to="/library"
                class="btn-secondary flex items-center justify-center gap-2 py-3 text-sm whitespace-nowrap">
                📖 句子库
            </router-link>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const title = import.meta.env.VITE_HOME_TITLE || '📚 LexiScribe';
const isVerified = localStorage.getItem('isVerified') === 'true';
const userEmail = localStorage.getItem('userEmail') || '';
const router = useRouter();
const stats = ref({ today: 0, total: 0 });
async function loadStats() {
    try {
        stats.value = await api.getStats();
    } catch (e) {
        router.push('/login');
    }
}

type ReviewStatus = 'NEW' | 'LEARNING' | 'REVIEW' | 'MATURE';

const progress = ref<{
    total: number;
    byStatus: Record<ReviewStatus, number>;
    todayPending: number;
    todayDone: number;
    streak: number;
}>({
    total: 0,
    byStatus: { NEW: 0, LEARNING: 0, REVIEW: 0, MATURE: 0 },
    todayPending: 0,
    todayDone: 0,
    streak: 0,
});

// 各状态百分比
function percent(status: ReviewStatus): number {
    if (progress.value.total === 0) return 0;
    return (progress.value.byStatus[status] / progress.value.total) * 100;
}

// 今日复习完成率
const todayPercent = computed(() => {
    const total = progress.value.todayDone + progress.value.todayPending;
    if (total === 0) return 100;
    return (progress.value.todayDone / total) * 100;
});

async function loadProgress() {
    try {
        progress.value = await api.getProgressStats();
    } catch (e) {
        console.error('加载学习进度失败', e);
    }
}

const showWelcome = ref(false);

function closeWelcome() {
    showWelcome.value = false;
    localStorage.setItem('lexiscribe_welcome_shown', 'true');
}

onMounted(() => {
    loadStats();
    loadProgress();
    // 检查是否已显示过欢迎弹窗
    const hasShown = localStorage.getItem('lexiscribe_welcome_shown');
    if (!hasShown) {
        showWelcome.value = true;
    }
});
</script>