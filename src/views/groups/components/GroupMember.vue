<template>
    <div>
        <div v-if="members.length === 0" class="text-center py-8 text-gray-400">
            还没有成员
        </div>
        <div v-else class="space-y-2">
            <div v-for="member in members" :key="member.id"
                class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                        {{ getInitial(member.nickname || member.email) }}
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ member.nickname || member.email }}
                        </p>
                        <p class="text-xs text-gray-400">{{ member.email }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span v-if="member.role === 'owner'" class="text-xs text-yellow-500">👑 创建者</span>
                    <span v-else-if="member.role === 'admin'" class="text-xs text-blue-500">管理员</span>
                    <span v-else class="text-xs text-gray-400">成员</span>
                    <span class="text-xs text-gray-400">{{ formatDate(member.joined_at) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    members: any[];
    isOwner?: boolean;
    groupId?: number;
}>();

const emit = defineEmits(['refresh']);

function getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() || '?';
}

function formatDate(date: string): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
</script>