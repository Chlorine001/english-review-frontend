<template>
    <div
        class="min-h-screen flex items-start p-4 pt-16 justify-center pb-32 overflow-y-auto h-screen bg-gray-50 dark:bg-[#1a1b2e]">
        <div class="w-full max-w-md p-8 card">
            <h2 class="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">注册</h2>

            <div v-if="errorMessage"
                class="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded">
                {{ errorMessage }}
            </div>

            <form @submit.prevent="handleRegister">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮箱</label>
                    <input v-model="email" type="email" required class="input-field" />
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
                    <input v-model="password" type="password" required class="input-field" />
                </div>
                <button type="submit" class="w-full btn-primary" :disabled="isRegister">
                    {{ isRegister ? '注册中...' : '注册' }}
                </button>
            </form>

            <p class="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                已有账号？<router-link to="/login" class="text-indigo-600 dark:text-indigo-400 underline">去登录</router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isRegister = ref(false);
// 优化错误消息，动态提取数字
function formatErrorMessage(msg: string): string {
    // 密码太短：尝试提取数字
    const match = msg.match(/>=(\d+)|minimum[:\s]+(\d+)/i);
    if (match) {
        const num = match[1] || match[2];
        return `密码长度至少为 ${num} 个字符`;
    }
    // 邮箱格式错误
    if (msg.includes('email') && (msg.includes('invalid') || msg.includes('format'))) {
        return '邮箱格式不正确';
    }
    // 邮箱已存在
    if (msg.includes('already exists')) {
        return '该邮箱已被注册';
    }
    // 其他错误，返回原消息
    return msg;
}

async function handleRegister() {
    errorMessage.value = '';
    try {
        isRegister.value = true;
        await api.register(email.value, password.value);
        // 注册成功后，发送验证码
        await api.sendVerification(email.value);
        // 跳转到验证页面
        router.push({ path: '/verify-email', query: { email: email.value } });
    } catch (e: any) {
        isRegister.value = false;
        errorMessage.value = formatErrorMessage(e.message || '注册失败，请检查网络');
    }
}
</script>