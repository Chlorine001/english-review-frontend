<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">修改密码</h3>
        <form @submit.prevent="changePassword">
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">当前密码</label>
                    <input v-model="oldPassword" type="password" class="input-field" placeholder="请输入当前密码"
                        autocomplete="current-password" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新密码</label>
                    <input v-model="newPassword" type="password" class="input-field" placeholder="至少6位"
                        autocomplete="new-password" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认新密码</label>
                    <input v-model="confirmPassword" type="password" class="input-field" placeholder="再次输入新密码"
                        autocomplete="new-password" />
                </div>
                <button type="submit" class="btn-primary w-full" :disabled="changingPassword">
                    {{ changingPassword ? '修改中...' : '修改密码' }}
                </button>
                <p v-if="passwordMessage" class="mt-2 text-sm" :class="passwordMessageType">
                    {{ passwordMessage }}
                </p>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api';

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
</script>