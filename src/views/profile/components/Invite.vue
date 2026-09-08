<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">邀请好友</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            邀请好友一起使用 LexiScribe，共同进步！
        </p>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">已邀请</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ stats.registered }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">已注册</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.verified }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">已认证</p>
            </div>
        </div>
        <!-- 邀请链接 -->
        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">你的专属邀请链接</p>
            <div class="flex gap-2">
                <input :value="inviteLink" readonly class="input-field flex-1 text-sm transition-colors duration-300"
                    :class="{
                        'text-gray-400 dark:text-gray-500': inviteLink,
                        'text-gray-900 dark:text-white': !inviteLink
                    }" placeholder="加载中..." />
                <button @click="copyInviteLink" class="btn-primary whitespace-nowrap" :disabled="!inviteLink">
                    复制
                </button>
            </div>
            <p v-if="inviteMessage" class="mt-2 text-sm" :class="inviteMessageType">{{ inviteMessage }}</p>
        </div>

        <!-- 邀请方法说明 -->
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>💡 分享链接给朋友，他们注册激活后你将获得积分奖励</p>
        </div>

        <!-- 邀请记录 -->
        <div v-if="records.length > 0" class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邀请记录</h4>

            <!-- 表头 -->
            <div
                class="grid grid-cols-12 gap-2 text-xs text-gray-400 dark:text-gray-500 px-2 py-1 border-b border-gray-200 dark:border-gray-700">
                <span class="col-span-5">邮箱 / IP</span>
                <span class="col-span-2">状态</span>
                <span class="col-span-4 text-right">时间</span>
            </div>

            <!-- 列表 -->
            <div class="space-y-1 max-h-48 overflow-y-auto">
                <div v-for="item in records" :key="item.id"
                    class="grid grid-cols-12 gap-2 items-center text-sm py-2 px-2 border-b border-gray-100 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <!-- 邮箱/IP -->
                    <span class="col-span-5 text-gray-600 dark:text-gray-300 truncate">
                        <!-- 已注册显示邮箱，待注册显示IP -->
                        <template v-if="item.status === 'registered'">
                            {{ item.invitee_email || '未填写' }}
                        </template>
                        <template v-else>
                            <span class="font-mono text-xs text-gray-500 dark:text-gray-400">
                                {{ item.ip_address || '未知IP' }}
                            </span>
                        </template>
                    </span>

                    <!-- 状态：3列 -->
                    <span class="col-span-2">
                        <span class="text-xs px-2 py-0.5 rounded-full" :class="{
                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': item.status === 'registered' && item.invitee_verified === 1,
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300': item.status === 'registered' && item.invitee_verified === 0,
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': item.status === 'accepted',
                            'bg-gray-100 dark:bg-gray-700 text-gray-500': item.status === 'pending',
                        }">
                            {{ item.status === 'registered' && item.invitee_verified === 1 ? '✅ 已认证' :
                                item.status === 'registered' ? '📧 未验证' :
                                    item.status === 'accepted' ? '⏳ 待注册' : '⏳ 等待中' }}
                        </span>
                    </span>

                    <!-- 时间：4列，右对齐 -->
                    <span class="col-span-4 text-right text-xs text-gray-400 dark:text-gray-500">
                        {{ formatDate(item.created_at) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">


const inviteLink = ref('');
const inviteError = ref(true);
const inviteMessage = ref('');
const inviteMessageType = ref('');
const stats = ref({ total: 0, registered: 0, verified: 0 });
const records = ref<any[]>([]);

async function loadInviteData() {
    try {
        // 获取邀请链接
        const [linkRes, statsRes] = await Promise.all([
            api.getInviteLink(),
            api.getInvitationStats(),
        ]);
        inviteLink.value = linkRes.link;
        inviteError.value = false; // 清除错误
        // 获取统计和记录
        stats.value = { total: statsRes.total, registered: statsRes.registered, verified: statsRes.verified };
        records.value = statsRes.records || [];

    } catch (e: any) {
        console.error('加载邀请数据失败', e);
        // ✅ 安全处理错误消息
        const errorMsg = typeof e?.message === 'string' ? e.message : '未知错误';
        if (errorMsg.includes('请先验证邮箱')) {
            // 处理邮箱未验证的错误
            inviteLink.value = '邮箱未验证，请先验证邮箱后使用邀请功能!';
            inviteError.value = false;
        }
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

// 显示完整日期时间（含时分秒）
function formatDate(date: string) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
    loadInviteData();
});
</script>