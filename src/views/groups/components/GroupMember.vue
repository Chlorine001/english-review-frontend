<template>
    <div>
        <div v-if="members.length === 0" class="text-center py-8 text-gray-400">
            还没有成员！快去邀请吧！
        </div>
        <div v-else class="space-y-1">
            <!-- ✅ 改用 Grid：左侧自适应，右侧固定 100px -->
            <div v-for="member in members" :key="member.id"
                class="grid grid-cols-[1fr_auto] items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
                <!-- 左侧：头像 + 名字/邮箱 -->
                <div class="flex items-center gap-3 min-w-0">
                    <div
                        class="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {{ getInitial(member.nickname || member.email) }}
                    </div>
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate text-left"
                            :title="member.nickname || member.email">
                            {{ member.nickname || member.email }}
                        </p>
                        <p v-if="member.nickname" class="text-xs text-gray-400 truncate text-left" :title="member.email">
                            {{ member.email }}
                        </p>
                    </div>
                </div>

                <!-- 右侧：角色 + 时间（垂直排列，固定宽度） -->
                <div class="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span class="text-xs font-medium whitespace-nowrap" :class="{
                        'text-yellow-500': member.role === 'owner',
                        'text-blue-500': member.role === 'admin',
                        'text-gray-400': member.role === 'member'
                    }">
                        <template v-if="member.role === 'owner'">👑 创建者</template>
                        <template v-else-if="member.role === 'admin'">🛡️ 管理员</template>
                        <template v-else>👤 成员</template>
                    </span>
                    <span class="text-xs text-gray-400 whitespace-nowrap">
                        {{ formatDate(member.joined_at) }}
                    </span>
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

import { formatDateOnly } from '@/utils/time';
function formatDate(date: string): string {
    return formatDateOnly(date)
    // → '2026-09-08'
}
</script>