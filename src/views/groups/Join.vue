<template>
    <div class="max-w-md mx-auto p-4 pt-20">
        <div class="card p-6">
            <div class="text-center mb-6">
                <div class="text-5xl mb-3">🤝</div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">加入小组</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    输入邀请码加入已有小组
                </p>
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        邀请码
                    </label>
                    <input v-model="inviteCode" type="text"
                        class="input-field text-center font-mono text-lg tracking-widest" placeholder="例如：GRP-XXX-XXX"
                        required autofocus />
                </div>

                <button type="submit" class="btn-primary w-full" :disabled="submitting">
                    {{ submitting ? '加入中...' : '🔗 加入小组' }}
                </button>

                <p v-if="errorMessage" class="mt-3 text-sm text-red-600 dark:text-red-400 text-center">
                    {{ errorMessage }}
                </p>
            </form>

            <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <router-link to="/groups" class="text-indigo-600 hover:underline">返回小组列表</router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';

const router = useRouter();
const inviteCode = ref('');
const submitting = ref(false);
const errorMessage = ref('');

async function handleSubmit() {
    if (!inviteCode.value.trim()) {
        errorMessage.value = '请输入邀请码';
        return;
    }

    submitting.value = true;
    errorMessage.value = '';

    try {
        const result = await api.joinGroup(inviteCode.value.trim());
        router.push(`/groups/${result.groupId}`);
    } catch (e: any) {
        errorMessage.value = e.message || '加入失败，请检查邀请码';
    } finally {
        submitting.value = false;
    }
}
</script>