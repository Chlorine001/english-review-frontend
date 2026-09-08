<template>
    <div>
        <div v-if="activities.length === 0" class="text-center py-8 text-gray-400">
            暂无动态
        </div>
        <div v-else class="space-y-2">
            <div v-for="item in activities" :key="item.id"
                class="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <span class="text-lg">{{ getIcon(item.type) }}</span>
                <div>
                    <p class="text-sm text-gray-700 dark:text-gray-300">{{ item.content }}</p>
                    <p class="text-xs text-gray-400">{{ formatDate(item.created_at) }}</p>
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
        join: '👋',
        share: '📤',
        review: '📚',
        like: '❤️',
    };
    return map[type] || '📌';
}

function formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
</script>