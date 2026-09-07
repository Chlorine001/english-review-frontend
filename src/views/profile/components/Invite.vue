<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">邀请好友</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            邀请好友一起使用 LexiScribe，共同进步！
        </p>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">已邀请</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.registered }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">已注册</p>
            </div>
        </div>
        <!-- 邀请链接 -->
        <!-- <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">你的专属邀请链接</p>
            <div class="flex gap-2">
                <input :value="inviteLink" readonly class="input-field flex-1 text-sm" />
                <button @click="copyInviteLink" class="btn-primary whitespace-nowrap">
                    复制
                </button>
            </div>
            <p v-if="inviteMessage" class="mt-2 text-sm text-green-600 dark:text-green-400">{{ inviteMessage }}</p>
        </div> -->
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">你的专属邀请链接</p>
            <div class="flex gap-2">
                <input :value="inviteLink" readonly class="input-field flex-1 text-sm" placeholder="加载中..." />
                <button @click="copyInviteLink" class="btn-primary whitespace-nowrap" :disabled="!inviteLink">
                    复制
                </button>
            </div>
            <p v-if="inviteMessage" class="mt-2 text-sm" :class="inviteMessageType">{{ inviteMessage }}</p>
        </div>

        <!-- 邀请方法说明 -->
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>💡 分享链接给朋友，他们注册后你将获得积分奖励</p>
        </div>

        <!-- 邀请记录 -->
        <div v-if="records.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邀请记录</h4>
            <div class="space-y-1 max-h-40 overflow-y-auto">
                <div v-for="item in records" :key="item.id"
                    class="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700">
                    <span class="text-gray-600 dark:text-gray-400">{{ item.invitee_email || '未填写' }}</span>
                    <span class="text-xs" :class="item.status === 'registered' ? 'text-green-600' : 'text-yellow-600'">
                        {{ item.status === 'registered' ? '✅ 已注册' : '⏳ 待注册' }}
                    </span>
                    <span class="text-xs text-gray-400">{{ formatDate(item.created_at) }}</span>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">


const inviteLink = ref('');
const inviteMessage = ref('');
const inviteMessageType = ref('');
const stats = ref({ total: 0, registered: 0 });
const records = ref<any[]>([]);

async function loadInviteData() {
    try {
        // 获取邀请链接
        const linkRes = await api.getInviteLink();
        inviteLink.value = linkRes.link;

        // 获取统计和记录
        const statsRes = await api.getInvitationStats();
        stats.value = { total: statsRes.total, registered: statsRes.registered };
        records.value = statsRes.records || [];
    } catch (e) {
        console.error('加载邀请数据失败', e);
    }
}

import { ref, onMounted } from 'vue';
import { api } from '@/api';

// 复制邀请链接
function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink.value)
        .then(() => {
            inviteMessage.value = '✅ 已复制邀请链接';
            inviteMessageType.value = 'text-green-600 dark:text-green-400';
            setTimeout(() => { inviteMessage.value = ''; }, 2000);
        })
        .catch(() => {
            inviteMessage.value = '复制失败，请手动复制';
        });
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('zh-CN');
}

onMounted(() => {
    loadInviteData();
});
</script>