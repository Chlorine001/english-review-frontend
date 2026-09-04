<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">邀请好友</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            邀请好友一起使用 LexiScribe，共同进步！
        </p>

        <!-- 邀请统计 -->
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ inviteStats.invited }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">已邀请</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ inviteStats.registered }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">已注册</p>
            </div>
        </div>

        <!-- 邀请链接 -->
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">你的专属邀请链接</p>
            <div class="flex gap-2">
                <input :value="inviteLink" readonly class="input-field flex-1 text-sm" />
                <button @click="copyInviteLink" class="btn-primary whitespace-nowrap">
                    复制
                </button>
            </div>
            <p v-if="inviteMessage" class="mt-2 text-sm text-green-600 dark:text-green-400">{{ inviteMessage }}</p>
        </div>

        <!-- 邀请方法说明 -->
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>💡 分享链接给朋友，他们注册后你将获得积分奖励（即将上线）</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// import { api } from '@/api';

const inviteLink = ref('');
const inviteMessage = ref('');
const inviteStats = ref({ invited: 0, registered: 0 });

// 生成邀请链接（含邀请码）
function generateInviteLink() {
    const userId = localStorage.getItem('userId') || '';
    const baseUrl = window.location.origin;
    inviteLink.value = `${baseUrl}/register?ref=${userId}`;
}

// 复制邀请链接
function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink.value)
        .then(() => {
            inviteMessage.value = '✅ 已复制邀请链接';
            setTimeout(() => { inviteMessage.value = ''; }, 2000);
        })
        .catch(() => {
            inviteMessage.value = '复制失败，请手动复制';
        });
}

// 加载邀请统计（接口暂未实现，这里用假数据）
async function loadInviteStats() {
    try {
        // TODO: 替换为真实 API
        // const stats = await api.getInviteStats();
        // inviteStats.value = stats;
        // 暂时用假数据
        inviteStats.value = { invited: 3, registered: 1 };
    } catch (e) {
        console.warn('加载邀请统计失败', e);
    }
}

onMounted(() => {
    generateInviteLink();
    loadInviteStats();
});
</script>