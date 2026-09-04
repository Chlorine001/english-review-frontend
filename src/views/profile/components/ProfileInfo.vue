<template>
    <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">个人信息</h3>
        <div class="space-y-4">
            <!-- 邮箱（只读） -->
            <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-500 dark:text-gray-400 w-16">邮箱</span>
                    <span class="text-gray-900 dark:text-white">{{ email }}</span>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500">已验证</span>
            </div>
        </div>

        <!-- 昵称（可编辑） -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4  flex-1">
                <span class="text-sm text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">昵称</span>
                <!-- flex items-center gap-2-->
                <input v-model="nickName" class="input-field py-1 px-2 text-sm w-full "
                    style="width: 180px; max-width: 100%;" placeholder={{ nickName }} @keydown.enter="updateNickname"
                    @keydown.esc="cancelEdit" autofocus :disabled="!isEditingNickname" />
            </div>
            <div class="flex items-center gap-2  flex-shrink-0">
                <button v-if="!isEditingNickname" @click="updateNickname"
                    class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                    修改
                </button>
                <template v-else>
                    <button @click="updateNickname"
                        class="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        :disabled="savingNickname">
                        {{ savingNickname ? '保存中...' : '保存' }}
                    </button>
                    <button @click="cancelEdit"
                        class="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                        取消
                    </button>
                </template>
            </div>
        </div>

        <!-- 会员信息（占位，可扩展） -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-500 dark:text-gray-400 w-16">会员</span>
                <span class="text-gray-900 dark:text-white">普通用户</span>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500">免费版</span>
        </div>

        <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-4">
                <span class="text-sm text-gray-500 dark:text-gray-400 w-16">积分</span>
                <span class="text-gray-900 dark:text-white">88</span>
            </div>
            <span class="text-xs text-gray-400 dark:text-gray-500">可兑换</span>
        </div>

    </div>


    <!-- 错误/成功消息 -->
    <p v-if="nicknameMessage" class="mt-3 text-sm" :class="nicknameMessageType">
        {{ nicknameMessage }}
    </p>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/api';

// const email = inject('userEmail') || '';
const email = localStorage.getItem('userEmail') || 'U';

const nickName = ref(localStorage.getItem('nickName') || '');
const savingNickname = ref(false);
const isEditingNickname = ref(false);
const issaved = ref(false);
const nicknameMessage = ref('');
const nicknameMessageType = ref('');

async function updateNickname() {
    if (!isEditingNickname.value) {
        isEditingNickname.value = true;
        return;
    }
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
        issaved.value = true;
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

async function cancelEdit() {
    isEditingNickname.value = false;
    nicknameMessage.value = '';
    nickName.value = localStorage.getItem('nickName') || '';
}

</script>