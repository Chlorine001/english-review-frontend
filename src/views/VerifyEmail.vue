<template>
    <div
        class="flex-1 flex items-start justify-center p-16 bg-gray-50 dark:bg-[#1a1b2e] pb-32 overflow-y-auto h-screen">
        <div class="w-full max-w-md p-8 card">
            <div class="text-center">
                <div class="text-5xl mb-3">📧</div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">验证邮箱</h2>
                <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                    我们已向 <strong>{{ email }}</strong> 发送了一封验证邮件，<br />
                    请输入邮件中的 6 位验证码。
                </p>
            </div>

            <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">验证码</label>
                <input v-model="code" type="text" maxlength="6" inputmode="numeric" pattern="[0-9]*"
                    class="input-field text-center text-2xl tracking-widest" placeholder="请输入验证码" @input="onCodeInput"
                    autofocus />
            </div>

            <div v-if="errorMessage" class="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
                {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="mt-3 text-sm text-green-600 dark:text-green-400 text-center">
                {{ successMessage }}
            </div>

            <button @click="verify" class="w-full btn-primary mt-4" :disabled="verifying || code.length !== 6">
                {{ verifying ? '验证中...' : '验证邮箱 ✅' }}
            </button>

            <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                没收到邮件？
                <button @click="resendCode" class="text-indigo-600 hover:underline"
                    :disabled="resending || countdown > 0">
                    {{ countdown > 0 ? `重新发送 (${countdown}s)` : (resending ? '发送中...' : '重新发送') }}
                </button>
            </div>

            <p class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <router-link to="/login" class="text-indigo-600 hover:underline">返回登录</router-link>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/api';

const router = useRouter();
const route = useRoute();

const email = ref('');
const code = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const verifying = ref(false);
const resending = ref(false);
const countdown = ref(0);
let timer: ReturnType<typeof setTimeout> | null = null;

function onCodeInput(e: Event) {
    const input = e.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 6);
    code.value = input.value;
    if (code.value.length === 6) {
        verify();
    }
}

async function verify() {
    if (code.value.length !== 6) return;
    verifying.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        await api.verifyEmail(email.value, code.value);
        successMessage.value = '✅ 验证成功！即将跳转登录...';
        setTimeout(() => {
            router.push('/login');
        }, 3000);
    } catch (e: any) {
        errorMessage.value = e.message || '验证失败，请重试';
    } finally {
        verifying.value = false;
    }
}

async function resendCode() {
    if (countdown.value > 0) return; // 倒计时中，不允许再次发送
    resending.value = true;
    errorMessage.value = '';
    successMessage.value = '';
    try {
        await api.sendVerification(email.value);
        successMessage.value = '✅ 验证码已重新发送，请查收邮件';
        // 开始 60 秒倒计时
        countdown.value = 60;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
                clearInterval(timer as ReturnType<typeof setInterval>);
                timer = null;
            }
        }, 1000);
    } catch (e: any) {
        errorMessage.value = e.message || '发送失败，请重试';
    } finally {
        resending.value = false;
    }
}

onMounted(() => {
    const emailParam = route.query.email;
    if (Array.isArray(emailParam)) {
        email.value = emailParam[0] || '';
    } else {
        email.value = emailParam || '';
    }
    if (!email.value) {
        router.push('/register');
    }
});

onBeforeUnmount(() => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
});
</script>