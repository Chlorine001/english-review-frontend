<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">通知设置</h3>
        <div class="space-y-3">
            <div v-for="item in notificationItems" :key="item.key"
                class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                    <p class="text-gray-800 dark:text-white font-medium">{{ item.label }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.description }}</p>
                </div>
                <button @click="toggleNotification(item.key)" class="px-3 py-1 rounded text-sm transition-colors"
                    :class="notifications[item.key]
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
                    {{ notifications[item.key] ? '已开启' : '已关闭' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 通知项配置
const notificationItems = [
    { key: 'daily', label: '每日复习提醒', description: '每天固定时间提醒你完成复习' },
    { key: 'email', label: '邮件通知', description: '接收系统邮件和活动通知' },
    { key: 'sound', label: '声音提醒', description: '复习时播放提示音' },
    { key: 'streak', label: '连续打卡提醒', description: '连续学习天数提醒' },
];

// 通知状态（可扩展为从 API 读取）
const notifications = ref<Record<string, boolean>>({
    daily: true,
    email: true,
    sound: false,
    streak: true,
});

function toggleNotification(key: string) {
    notifications.value[key] = !notifications.value[key];
    // TODO: 调用 API 保存设置
    console.log(`📢 通知 ${key} 已${notifications.value[key] ? '开启' : '关闭'}`);
}
</script>