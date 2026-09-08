<template>
    <div class="max-w-6xl mx-auto p-4">
        <!-- ====== 桌面端：左右布局 ====== -->
        <div v-if="!isMobile" class="flex flex-row gap-6">
            <!-- 左侧导航 -->
            <aside class="w-56 flex-shrink-0">
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
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'">
                            {{ item.icon }} {{ item.label }}
                        </button>
                    </nav>
                </div>
            </aside>

            <!-- 右侧内容 -->
            <main class="flex-1">
                <component :is="currentComponent" />
            </main>
        </div>

        <!-- ====== 移动端：单列布局 ====== -->
        <div v-else class="max-w-2xl mx-auto">
            <!-- 用户卡片 -->
            <div class="card p-6 text-center mb-4">
                <div
                    class="w-20 h-20 rounded-full bg-indigo-500 text-white text-3xl flex items-center justify-center mx-auto mb-3">
                    {{ userInitial }}
                </div>
                <p class="text-xl font-medium text-gray-900 dark:text-white">{{ displayName }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ email }}</p>
            </div>

            <!-- 功能列表（仅在未选中时显示） -->
            <div v-if="!mobileSelectedTab" class="card divide-y divide-gray-100 dark:divide-gray-700">
                <div v-for="item in menuItems" :key="item.key" @click="mobileSelectedTab = item.key"
                    class="flex items-center justify-between py-4 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-lg">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">{{ item.icon }}</span>
                        <span class="text-gray-800 dark:text-white">{{ item.label }}</span>
                    </div>
                    <span class="text-gray-400 dark:text-gray-500">›</span>
                </div>
            </div>

            <!-- 内容区域（选中后显示） -->
            <div v-else class="mt-4">
                <button @click="mobileSelectedTab = null"
                    class="text-sm text-gray-500 dark:text-gray-400 mb-4 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    ← 返回列表
                </button>
                <component :is="mobileCurrentComponent" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue';

// 懒加载组件
const ProfileInfo = defineAsyncComponent(() => import('./components/ProfileInfo.vue'));
const ChangePassword = defineAsyncComponent(() => import('./components/ChangePassword.vue'));
const Notifications = defineAsyncComponent(() => import('./components/Notifications.vue'));
const Invite = defineAsyncComponent(() => import('./components/Invite.vue'));
const Points = defineAsyncComponent(() => import('./components/Points.vue')); 

// 菜单配置
const menuItems = [
    { key: 'profile', icon: '👤', label: '个人信息', component: ProfileInfo },
    { key: 'password', icon: '🔒', label: '修改密码', component: ChangePassword },
    { key: 'notifications', icon: '🔔', label: '通知', component: Notifications },
    { key: 'invite', icon: '🚀', label: '邀请', component: Invite },
    { key: 'points', icon: '🏆', label: '积分', component: Points },
];

const activeTab = ref('profile'); // 桌面端专用
const mobileSelectedTab = ref<string | null>(null);  // 移动端专用
const isMobile = ref(window.innerWidth < 768);

// 当前组件
const currentComponent = computed(() => {
    const found = menuItems.find(item => item.key === activeTab.value);
    return found?.component || null;
});
// 移动端专用
const mobileCurrentComponent = computed(() => {
    if (!mobileSelectedTab.value) return null;
    const found = menuItems.find(item => item.key === mobileSelectedTab.value);
    return found?.component || null;
});

// 用户信息
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

// 监听窗口大小变化
// 当从移动端切换到桌面端时，重置移动端选中状态
function handleResize() {
    isMobile.value = window.innerWidth < 768;
    if (!isMobile.value) {
        mobileSelectedTab.value = null;
    }
}

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

// // 提供共享数据给子组件（可选）
// import { provide } from 'vue';
// provide('userEmail', email);
</script>