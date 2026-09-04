<template>
    <div class="max-w-2xl mx-auto p-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">个人设置</h2>

        <!-- 邮箱（只读） -->
        <div class="card p-4 mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
            <p class="text-gray-900 dark:text-white">{{ email }}</p>
        </div>

        <!-- 昵称 -->
        <div class="card p-4 mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">昵称</label>
            <div class="flex gap-2">
                <input v-model="nickName" class="input-field flex-1" placeholder="输入昵称" />
                <button @click="updateNickname" class="btn-primary" :disabled="savingNickname">
                    {{ savingNickname ? '保存中...' : '保存' }}
                </button>
            </div>
            <p v-if="nicknameMessage" class="mt-2 text-sm" :class="nicknameMessageType">{{ nicknameMessage }}</p>
        </div>

        <!-- 修改密码 -->
        <div class="card p-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">修改密码</h3>
            <form @submit.prevent="changePassword">
                <!-- 隐藏的用户名字段（仅用于辅助功能） -->
                <!-- <input type="email" :value="email" class="hidden" aria-hidden="true" autocomplete="username" readonly /> -->
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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api';

const nickName = ref(localStorage.getItem('nickName') || '');
const email = localStorage.getItem('userEmail');

const savingNickname = ref(false);
const nicknameMessage = ref('');
const nicknameMessageType = ref('');

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref('');

async function updateNickname() {
    if (!nickName.value) {
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
        setTimeout(() => {
            location.reload()
            // router.go(0)
        }, 500);
    } catch (e: any) {
        nicknameMessage.value = e.message || '更新失败';
        nicknameMessageType.value = 'text-red-600 dark:text-red-400';
    } finally {
        savingNickname.value = false;
    }
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