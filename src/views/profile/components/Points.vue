<template>

    <div class="card p-6">

        <!-- 积分卡片 -->
        <div class="card p-6 mb-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="text-5xl">{{ points.levelIcon }}</div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">当前等级</p>
                        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ points.level }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ points.total }} 积分</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500 dark:text-gray-400">距离下一级</p>
                    <p class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{{ nextLevelPoints - points.total
                        }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">积分</p>
                </div>
            </div>

            <!-- 进度条 -->
            <div class="mt-4">
                <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{{ points.level }} ({{ points.total }}分)</span>
                    <span>{{ nextLevelLabel }} ({{ nextLevelPoints }}分)</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        :style="{ width: progressPercent + '%' }"></div>
                </div>
            </div>
        </div>

        <!-- 快捷获取积分方式 -->
        <div class="card p-4 mb-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">获取积分方式</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div v-for="rule in pointRules" :key="rule.key"
                    class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                    <div class="text-2xl">{{ rule.icon }}</div>
                    <p class="text-sm font-medium text-gray-800 dark:text-white">{{ rule.label }}</p>
                    <p class="text-xs text-indigo-600 dark:text-indigo-400">+{{ rule.points }} 积分</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500">{{ rule.limit }}</p>
                </div>
            </div>
        </div>

        <!-- 积分记录 -->
        <div class="card p-4">
            <div class="flex justify-between items-center mb-3">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">积分记录</h4>
                <span class="text-xs text-gray-400">共 {{ pointsLog.length }} 条</span>
            </div>

            <div v-if="pointsLog.length === 0" class="text-center py-8 text-gray-400 dark:text-gray-500">
                <p>还没有积分记录</p>
                <p class="text-sm">开始复习或邀请好友获取积分吧！</p>
            </div>

            <div v-else class="space-y-1 max-h-64 overflow-y-auto">
                <!-- 表头 -->
                <div
                    class="grid grid-cols-12 gap-2 text-xs text-gray-400 dark:text-gray-500 px-2 py-1 border-b border-gray-200 dark:border-gray-700">
                    <span class="col-span-6 text-left">描述</span>
                    <span class="col-span-3 text-center">积分</span>
                    <span class="col-span-3 text-right">时间</span>
                </div>

                <!-- 列表 -->
                <div v-for="item in pointsLog" :key="item.id"
                    class="grid grid-cols-12 gap-2 items-center text-sm py-2 px-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded">
                    <!-- 描述：6列 -->
                    <span class="col-span-6 text-gray-700 dark:text-gray-300 line-clamp-2 text-left">
                        {{ typeIcon(item.type) }} {{ item.description }}
                    </span>

                    <!-- 积分：3列，居中 -->
                    <span class="col-span-3 text-center font-medium text-green-600 dark:text-green-400">
                        +{{ item.points }}
                    </span>

                    <!-- 时间：3列，右对齐 -->
                    <span class="col-span-3 text-right text-xs text-gray-400 dark:text-gray-500">
                        {{ formatDate(item.created_at) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/api';

const points = ref({
    total: 0,
    level: '青铜',
    levelIcon: '🥉',
});
const pointsLog = ref<any[]>([]);

// 等级配置
const levelConfig = [
    { name: '青铜', icon: '🥉', minPoints: 0 },
    { name: '白银', icon: '🥈', minPoints: 50 },
    { name: '黄金', icon: '🥇', minPoints: 100 },
    { name: '钻石', icon: '💎', minPoints: 200 },
    { name: '传奇', icon: '🏆', minPoints: 500 },
];

// 积分规则
const pointRules = [
    { key: 'invite', icon: '🚀', label: '邀请好友', points: 10, limit: '每次邀请' },
    { key: 'daily', icon: '📅', label: '每日登录', points: 1, limit: '每天1次' },
    { key: 'review', icon: '📚', label: '完成复习', points: 1, limit: '每次（Good/Easy）' },
    { key: 'streak', icon: '🔥', label: '连续打卡', points: 5, limit: '每7天' },
];

const nextLevel = computed(() => {
    const current = levelConfig.find(l => l.name === points.value.level);
    const idx = levelConfig.indexOf(current || levelConfig[0]);
    return levelConfig[idx + 1] || null;
});

const nextLevelLabel = computed(() => nextLevel.value?.name || 'MAX');
const nextLevelPoints = computed(() => nextLevel.value?.minPoints || points.value.total);

const progressPercent = computed(() => {
    const current = levelConfig.findIndex(l => l.name === points.value.level);
    const next = current + 1;
    if (next >= levelConfig.length) return 100;
    const currentMin = levelConfig[current].minPoints;
    const nextMin = levelConfig[next].minPoints;
    const range = nextMin - currentMin;
    const progress = points.value.total - currentMin;
    return Math.min(100, Math.max(0, (progress / range) * 100));
});

function typeIcon(type: string): string {
    const map: Record<string, string> = {
        invite_register: '🚀',
        daily_login: '📅',
        review_complete: '📚',
        streak: '🔥',
        system: '🎁',
    };
    return map[type] || '✨';
}

function formatDate(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

async function loadPoints() {
    try {
        const [pointsData, logData] = await Promise.all([
            api.getPoints(),
            api.getPointsLog(),
        ]);
        points.value = pointsData;
        pointsLog.value = logData || [];
    } catch (e) {
        console.error('加载积分数据失败', e);
    }
}

onMounted(loadPoints);
</script>