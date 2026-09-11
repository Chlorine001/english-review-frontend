<template>
    <div>
        <div v-if="activities.length === 0" class="text-center py-8 text-gray-400">
            暂无动态
        </div>
        <div v-else class="space-y-1">
            <div v-for="item in activities" :key="item.id"
                class="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <!-- 图标 -->
                <span class="text-lg flex-shrink-0 leading-none mt-0.5">
                    {{ getIcon(item.type) }}
                </span>

                <!-- 内容 -->
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-700 dark:text-gray-300 break-words text-left">
                        <!-- ✅ 昵称 + 内容 -->
                        <span class="font-medium text-gray-900 dark:text-white">
                            {{ item.user_nickname || '用户' }}
                        </span>
                        <span class="ml-1">{{ item.content }}</span>
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5 text-left">
                        {{ formatDate(item.created_at) }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
defineProps<{
    activities: any[];
}>();

function getIcon(type: string): string {
    const map: Record<string, string> = {
        create: '✨',    // 创建小组
        join: '👋',      // 加入小组
        share: '📤',     // 分享句子
        like: '❤️',      // 点赞
        review: '📚',    // 完成复习
        leave: '🚪',     // 退出小组
        owner: '👑',     // 转让群主 / 成为创建者
        kick: '🚫',      // 移除成员
        update: '✏️',    // 更新信息
    };
    return map[type] || '📌';
}

import { formatBeijingTime } from '@/utils/time';
function formatDate(date: string): string {
    return formatBeijingTime(date)
    // → '2026-09-08'
}

</script>