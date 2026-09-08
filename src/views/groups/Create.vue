<template>
    <div class="max-w-2xl mx-auto p-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">创建小组</h2>

        <form @submit.prevent="handleSubmit" class="card p-6">
            <!-- 小组名称 -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    小组名称 <span class="text-red-500">*</span>
                </label>
                <input v-model="form.name" type="text" class="input-field" placeholder="请输入小组名称（2-20个字符）" maxlength="20"
                    required />
                <p class="text-xs text-gray-400 mt-1">{{ form.name.length }}/20</p>
            </div>

            <!-- 小组描述 -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    小组描述
                </label>
                <textarea v-model="form.description" rows="3" class="input-field" placeholder="介绍一下这个小组（选填）"
                    maxlength="200" />
                <p class="text-xs text-gray-400 mt-1">{{ form.description.length }}/200</p>
            </div>

            <!-- 公开/私密 -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    小组可见性
                </label>
                <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="form.isPublic" type="radio" :value="true" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">🌍 公开</span>
                        <span class="text-xs text-gray-400">（所有人可见）</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="form.isPublic" type="radio" :value="false" />
                        <span class="text-sm text-gray-700 dark:text-gray-300">🔒 私密</span>
                        <span class="text-xs text-gray-400">（仅成员可见）</span>
                    </label>
                </div>
            </div>

            <!-- 提交按钮 -->
            <div class="flex gap-3">
                <button type="submit" class="btn-primary flex-1" :disabled="submitting">
                    {{ submitting ? '创建中...' : '🚀 创建小组' }}
                </button>
                <router-link to="/groups" class="btn-secondary flex-1 text-center">取消</router-link>
            </div>

            <!-- 错误提示 -->
            <p v-if="errorMessage" class="mt-3 text-sm text-red-600 dark:text-red-400">
                {{ errorMessage }}
            </p>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';

const router = useRouter();
const submitting = ref(false);
const errorMessage = ref('');

const form = reactive({
    name: '',
    description: '',
    isPublic: true,
});

async function handleSubmit() {
    if (!form.name.trim() || form.name.length < 2) {
        errorMessage.value = '小组名称至少2个字符';
        return;
    }

    submitting.value = true;
    errorMessage.value = '';

    try {
        const result = await api.createGroup({
            name: form.name.trim(),
            description: form.description.trim(),
            isPublic: form.isPublic,
        });
        // 跳转到小组详情页
        router.push(`/groups/${result.id}`);
    } catch (e: any) {
        errorMessage.value = e.message || '创建失败，请重试';
    } finally {
        submitting.value = false;
    }
}
</script>