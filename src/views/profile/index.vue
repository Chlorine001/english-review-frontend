<template>
    <div class="max-w-6xl mx-auto p-4 pb-32 overflow-y-auto h-screen">
        <div class="flex flex-col md:flex-row gap-6">
            <!-- 左侧导航 -->
            <aside class="w-full md:w-56 flex-shrink-0">
                <div class="card p-4 sticky top-4">
                    <!-- 用户头像信息 -->
                    <div class="text-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div
                            class="w-16 h-16 rounded-full bg-indigo-500 text-white text-2xl flex items-center justify-center mx-auto mb-2">
                            {{ userInitial }}
                        </div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ displayName }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ email }}</p>
                    </div>

                    <nav class="space-y-1">
                        <button v-for="item in menuItems" :key="item.key" @click="activeTab = item.key"
                            class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors" :class="activeTab === item.key
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                ">
                            {{ item.icon }} {{ item.label }}
                        </button>
                    </nav>
                </div>
            </aside>

            <!-- 右侧内容（动态组件） -->
            <main class="flex-1">
                <component :is="currentComponent" />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';

// 懒加载各功能组件（按需加载，提升首屏性能）
const ProfileInfo = defineAsyncComponent(() => import('./components/ProfileInfo.vue'));
const ChangePassword = defineAsyncComponent(() => import('./components/ChangePassword.vue'));
const Notifications = defineAsyncComponent(() => import('./components/Notifications.vue'));
const Invite = defineAsyncComponent(() => import('./components/Invite.vue'));

// 菜单配置：key 必须与组件名对应
const menuItems = [
    { key: 'profile', icon: '👤', label: '个人信息', component: ProfileInfo },
    { key: 'password', icon: '🔒', label: '修改密码', component: ChangePassword },
    { key: 'notifications', icon: '🔔', label: '通知', component: Notifications },
    { key: 'invite', icon: '📨', label: '邀请', component: Invite },
];

const activeTab = ref('profile');

// 当前显示的组件
const currentComponent = computed(() => {
    const found = menuItems.find(item => item.key === activeTab.value);
    return found?.component || null;
});

// 用户信息
const email = localStorage.getItem('userEmail') || 'U';
const userInitial = computed(() => {
    const nickname = localStorage.getItem('nickName');
    if (nickname) {
        const firstChar = Array.from(nickname)[0] || '?';
        return firstChar.toUpperCase();
    } else {
        return email.charAt(0).toUpperCase();
    }
});

const displayName = computed(() => {
    return localStorage.getItem('nickName') || email;
});

// // 提供共享数据给子组件（可选）
// import { provide } from 'vue';
// provide('userEmail', email);
</script>