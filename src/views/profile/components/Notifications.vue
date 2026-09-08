<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">通知设置</h3>

        <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <div v-for="item in notificationItems" :key="item.key" class="flex items-center justify-between py-3">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                    <span class="text-lg flex-shrink-0">{{ item.icon }}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ item.label }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.description }}</p>
                    </div>
                </div>
                <!-- <button @click="toggleNotification(item.key)"
                    class="px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ml-4" :class="notifications[item.key]
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
                    {{ notifications[item.key] ? '已开启' : '已关闭' }}
                </button> -->
                <button @click="toggleNotification(item.key)"
                    class="relative w-10 h-5 rounded-full transition-colors flex-shrink-0" :class="notifications[item.key]
                        ? 'bg-indigo-600 dark:bg-indigo-500'
                        : 'bg-gray-300 dark:bg-gray-600'">
                    <span class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                        :class="notifications[item.key] ? 'translate-x-5' : ''" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const notificationItems = [
    { key: 'email', icon: '📧', label: '邮件通知', description: '接收系统邮件和活动通知' },
    { key: 'daily', icon: '📅', label: '每日复习提醒', description: '每天固定时间提醒你完成复习' },
    // { key: 'sound', icon: '🔊', label: '声音提醒', description: '复习时播放提示音' },
    { key: 'streak', icon: '🔥', label: '连续打卡提醒', description: '连续学习天数提醒' },
];

const notifications = ref<Record<string, boolean>>({
    daily: true,
    email: true,
    sound: false,
    streak: true,
});

function toggleNotification(key: string) {
    notifications.value[key] = !notifications.value[key];
    // TODO: 调用 API 保存设置
}
</script>