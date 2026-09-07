<template>
    <div class="max-w-2xl mx-auto p-4">
        <!-- 用户卡片 -->
        <div class="card p-6 text-center mb-4">
            <div
                class="w-20 h-20 rounded-full bg-indigo-500 text-white text-3xl flex items-center justify-center mx-auto mb-3">
                {{ userInitial }}
            </div>
            <p class="text-xl font-medium text-gray-900 dark:text-white">{{ displayName }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ email }}</p>
        </div>

        <!-- 功能列表 -->
        <div class="card divide-y divide-gray-100 dark:divide-gray-700">
            <div v-for="item in menuItems" :key="item.key" @click="navigateTo(item.key)"
                class="flex items-center justify-between py-4 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-lg">
                <div class="flex items-center gap-3">
                    <span class="text-xl">{{ item.icon }}</span>
                    <span class="text-gray-800 dark:text-white">{{ item.label }}</span>
                </div>
                <span class="text-gray-400 dark:text-gray-500">›</span>
            </div>
        </div>

        <!-- 返回上一页 -->
        <button @click="router.back"
            class="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            ← 返回
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const email = localStorage.getItem('userEmail') || 'U';
const userInitial = computed(() => {
    const nickname = localStorage.getItem('nickName');
    if (nickname) {
        const firstChar = Array.from(nickname)[0] || '?';
        return firstChar.toUpperCase();
    }
    return email.charAt(0).toUpperCase();
});

const displayName = computed(() => {
    return localStorage.getItem('nickName') || email;
});

const menuItems = [
    { key: 'info', icon: '👤', label: '个人信息' },
    { key: 'password', icon: '🔒', label: '修改密码' },
    { key: 'notifications', icon: '🔔', label: '通知' },
    { key: 'invite', icon: '📨', label: '邀请' },
];

function navigateTo(key: string) {
    // 跳转到对应的独立移动端页面
    router.push('/profile-mobile/' + key);
}
</script>