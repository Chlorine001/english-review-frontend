<template>
    <div class="max-w-6xl mx-auto p-4 overflow-y-auto h-screen pb-32">
        <div class="flex flex-col md:flex-row gap-6">
            <!-- ====== 左侧导航 ====== -->
            <div class="w-full md:w-56 flex-shrink-0">
                <div class="card p-4 sticky top-4">
                    <!-- 用户头像和信息 -->
                    <div class="text-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div
                            class="w-16 h-16 rounded-full bg-indigo-500 text-white text-2xl flex items-center justify-center mx-auto mb-2">
                            {{ userInitial }}
                        </div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ displayName }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ email }}</p>
                    </div>

                    <!-- 导航菜单 -->
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
            </div>

            <!-- ====== 右侧内容 ====== -->
            <div class="flex-1">
                <!-- 个人信息 -->
                <div v-if="activeTab === 'profile'" class="card p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">个人信息</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
                            <p class="text-gray-900 dark:text-white">{{ email }}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">昵称</label>
                            <div class="flex gap-2">
                                <input v-model="nickName" class="input-field flex-1" placeholder="输入昵称" />
                                <button @click="updateNickname" class="btn-primary" :disabled="savingNickname">
                                    {{ savingNickname ? '保存中...' : '保存' }}
                                </button>
                            </div>
                            <p v-if="nicknameMessage" class="mt-2 text-sm" :class="nicknameMessageType">{{
                                nicknameMessage }}</p>
                        </div>
                    </div>
                </div>

                <!-- 修改密码 -->
                <div v-if="activeTab === 'password'" class="card p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h3>
                    <form @submit.prevent="changePassword">
                        <div class="space-y-3">
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">当前密码</label>
                                <input v-model="oldPassword" type="password" class="input-field" placeholder="请输入当前密码"
                                    autocomplete="current-password" />
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新密码</label>
                                <input v-model="newPassword" type="password" class="input-field" placeholder="至少6位"
                                    autocomplete="new-password" />
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认新密码</label>
                                <input v-model="confirmPassword" type="password" class="input-field"
                                    placeholder="再次输入新密码" autocomplete="new-password" />
                            </div>
                            <button type="submit" class="btn-primary w-full" :disabled="changingPassword">
                                {{ changingPassword ? '修改中...' : '修改密码' }}
                            </button>
                            <p v-if="passwordMessage" class="mt-2 text-sm" :class="passwordMessageType">{{
                                passwordMessage }}</p>
                        </div>
                    </form>
                </div>

                <!-- 通知 -->
                <div v-if="activeTab === 'notifications'" class="card p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">通知设置</h3>
                    <div class="space-y-3">
                        <div
                            class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <p class="text-gray-800 dark:text-white font-medium">每日复习提醒</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">每天固定时间提醒你完成复习</p>
                            </div>
                            <button @click="toggleNotification('daily')"
                                class="px-3 py-1 rounded text-sm transition-colors" :class="notifications.daily
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
                                {{ notifications.daily ? '已开启' : '已关闭' }}
                            </button>
                        </div>
                        <div
                            class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <p class="text-gray-800 dark:text-white font-medium">邮件通知</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">接收系统邮件和活动通知</p>
                            </div>
                            <button @click="toggleNotification('email')"
                                class="px-3 py-1 rounded text-sm transition-colors" :class="notifications.email
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
                                {{ notifications.email ? '已开启' : '已关闭' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 邀请 -->
                <div v-if="activeTab === 'invite'" class="card p-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">邀请好友</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        邀请好友一起使用 LexiScribe，共同进步！
                    </p>
                    <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">你的专属邀请链接</p>
                        <div class="flex gap-2">
                            <input :value="inviteLink" readonly class="input-field flex-1 text-sm" />
                            <button @click="copyInviteLink" class="btn-primary whitespace-nowrap">
                                复制
                            </button>
                        </div>
                        <p v-if="inviteMessage" class="mt-2 text-sm text-green-600 dark:text-green-400">{{ inviteMessage
                            }}</p>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-4">
                        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                            <p class="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">已邀请</p>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-center">
                            <p class="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">已注册</p>
                        </div>
                    </div>
                </div>

                <!-- 空白占位（防止切换时闪烁） -->
                <div v-if="!['profile', 'password', 'notifications', 'invite'].includes(activeTab)" class="card p-6">
                    <p class="text-gray-500 dark:text-gray-400">功能开发中...</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from '@/api';

// ====== 菜单配置 ======
const menuItems = [
    { key: 'profile', icon: '👤', label: '个人信息' },
    { key: 'password', icon: '🔒', label: '修改密码' },
    { key: 'notifications', icon: '🔔', label: '通知' },
    { key: 'invite', icon: '📨', label: '邀请' },
    { key: 'test', icon: '🚗', label: '补位' },
];

const activeTab = ref('profile');

// ====== 用户信息 ======
const nickName = ref(localStorage.getItem('nickName') || '');
const email = localStorage.getItem('userEmail') || '未设置邮箱';

const userInitial = computed(() => {
    const name = localStorage.getItem('nickName') || email || 'U';
    return name.charAt(0).toUpperCase();
});

const displayName = computed(() => {
    return localStorage.getItem('nickName') || email || '未命名用户';
});

// ====== 昵称修改 ======
const savingNickname = ref(false);
const nicknameMessage = ref('');
const nicknameMessageType = ref('');

async function updateNickname() {
    if (!nickName.value?.trim()) {
        nicknameMessage.value = '昵称不能为空';
        nicknameMessageType.value = 'text-red-600 dark:text-red-400';
        return;
    }
    savingNickname.value = true;
    nicknameMessage.value = '';
    try {
        const res = await api.updateProfile(nickName.value.trim());
        localStorage.setItem('nickName', res.nickname);
        nicknameMessage.value = '✅ 昵称更新成功';
        nicknameMessageType.value = 'text-green-600 dark:text-green-400';
        setTimeout(() => location.reload(), 500);
    } catch (e: any) {
        nicknameMessage.value = e.message || '更新失败';
        nicknameMessageType.value = 'text-red-600 dark:text-red-400';
    } finally {
        savingNickname.value = false;
    }
}

// ====== 修改密码 ======
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref('');

async function changePassword() {
    if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
        passwordMessage.value = '请填写完整信息';
        passwordMessageType.value = 'text-red-600 dark:text-red-400';
        return;
    }
    if (newPassword.value.length < 6) {
        passwordMessage.value = '新密码至少6位';
        passwordMessageType.value = 'text-red-600 dark:text-red-400';
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        passwordMessage.value = '两次输入的密码不一致';
        passwordMessageType.value = 'text-red-600 dark:text-red-400';
        return;
    }
    changingPassword.value = true;
    passwordMessage.value = '';
    try {
        await api.changePassword(oldPassword.value, newPassword.value);
        passwordMessage.value = '✅ 密码修改成功';
        passwordMessageType.value = 'text-green-600 dark:text-green-400';
        oldPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (e: any) {
        passwordMessage.value = e.message || '修改失败';
        passwordMessageType.value = 'text-red-600 dark:text-red-400';
    } finally {
        changingPassword.value = false;
    }
}

// ====== 通知 ======
const notifications = ref({
    daily: true,
    email: true,
});

function toggleNotification(key: keyof typeof notifications.value) {
    notifications.value[key] = !notifications.value[key];
    // TODO: 调用 API 保存设置
}

// ====== 邀请 ======
const inviteLink = ref(`${window.location.origin}/register?ref=${localStorage.getItem('userEmail') || ''}`);
const inviteMessage = ref('');

function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink.value).then(() => {
        inviteMessage.value = '✅ 已复制邀请链接';
        setTimeout(() => { inviteMessage.value = ''; }, 2000);
    }).catch(() => {
        inviteMessage.value = '复制失败，请手动复制';
    });
}
</script>