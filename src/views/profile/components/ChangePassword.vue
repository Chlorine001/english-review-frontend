<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h3>

        <!-- 当前密码 -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4 flex-1">
                <span class="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">当前密码</span>
                <input v-model="oldPassword" type="password"
                    class="text-sm bg-transparent py-1 px-2 rounded outline-none transition-all duration-200 w-[180px]"
                    :class="isEditing
                        ? 'border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800'
                        : 'border border-transparent hover:border-gray-200 dark:hover:border-gray-600'"
                    :readonly="!isEditing" placeholder="请输入当前密码" autocomplete="current-password"
                    @focus="isEditing = true" @keydown.enter="changePassword" @keydown.esc="cancelEdit" />
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <template v-if="isEditing">
                    <button @click="changePassword"
                        class="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        :disabled="changingPassword">
                        {{ changingPassword ? '修改中...' : '保存' }}
                    </button>
                    <button @click="cancelEdit"
                        class="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                        取消
                    </button>
                </template>
                <button v-else @click="startEdit"
                    class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                    修改
                </button>
            </div>
        </div>

        <!-- 新密码 -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4 flex-1">
                <span class="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">新密码</span>
                <input v-model="newPassword" type="password"
                    class="text-sm bg-transparent py-1 px-2 rounded outline-none transition-all duration-200 w-[180px]"
                    :class="isEditing
                        ? 'border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800'
                        : 'border border-transparent hover:border-gray-200 dark:hover:border-gray-600'"
                    :readonly="!isEditing" placeholder="至少6位" autocomplete="new-password" @focus="isEditing = true"
                    @keydown.enter="changePassword" @keydown.esc="cancelEdit" />
            </div>
            <!-- 右侧占位，保持对齐 -->
            <div class="w-[90px] flex-shrink-0"></div>
        </div>

        <!-- 确认新密码 -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4 flex-1">
                <span class="text-sm text-gray-500 dark:text-gray-400 w-20 flex-shrink-0">确认密码</span>
                <input v-model="confirmPassword" type="password"
                    class="text-sm bg-transparent py-1 px-2 rounded outline-none transition-all duration-200 w-[180px]"
                    :class="isEditing
                        ? 'border border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-800'
                        : 'border border-transparent hover:border-gray-200 dark:hover:border-gray-600'"
                    :readonly="!isEditing" placeholder="再次输入新密码" autocomplete="new-password" @focus="isEditing = true"
                    @keydown.enter="changePassword" @keydown.esc="cancelEdit" />
            </div>
            <div class="w-[90px] flex-shrink-0"></div>
        </div>

        <!-- 消息提示 -->
        <p v-if="passwordMessage" class="mt-3 text-sm" :class="passwordMessageType">
            {{ passwordMessage }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';

const router = useRouter();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref('');
const isEditing = ref(false);

function startEdit() {
    isEditing.value = true;
    passwordMessage.value = '';
}

function cancelEdit() {
    isEditing.value = false;
    oldPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    passwordMessage.value = '';
}

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
        passwordMessage.value = '✅ 密码修改成功，请重新登录';
        passwordMessageType.value = 'text-green-600 dark:text-green-400';

        // 清除登录状态，跳转登录页
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('nickName');
        localStorage.removeItem('userEmail');

        setTimeout(() => {
            router.push('/login');
        }, 1500);
    } catch (e: any) {
        passwordMessage.value = e.message || '修改失败，请检查当前密码是否正确';
        passwordMessageType.value = 'text-red-600 dark:text-red-400';
        // 修改失败时保留编辑状态，方便重试
    } finally {
        changingPassword.value = false;
        isEditing.value = false;
    }
}
</script>