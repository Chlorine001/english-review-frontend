<template>
    <div>
        <!-- 添加句子到小组 -->
        <div class="mb-4">
            <button @click="showAddModal = true" class="btn-primary text-sm">
                ➕ 添加句子到小组
            </button>
        </div>

        <div v-if="sentences.length === 0" class="text-center py-8 text-gray-400">
            还没有分享的句子
        </div>

        <div v-else class="space-y-3">
            <div v-for="item in sentences" :key="item.id"
                class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <p class="text-gray-900 dark:text-white font-medium">{{ item.content }}</p>
                <p class="text-gray-600 dark:text-gray-300 text-sm">{{ item.translation }}</p>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>贡献者：{{ item.user_nickname || item.user_email }}</span>
                    <span>{{ formatDate(item.created_at) }}</span>
                    <button @click="likeSentence(item.id)" class="hover:text-red-500">
                        ❤️ {{ item.likes || 0 }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 添加句子弹窗 -->
        <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">添加句子到小组</h3>
                <select v-model="selectedSentenceId" class="input-field mb-4">
                    <option value="">选择已保存的句子</option>
                    <option v-for="s in mySentences" :key="s.id" :value="s.id">
                        {{ s.content.slice(0, 50) }}
                    </option>
                </select>
                <div class="flex gap-2">
                    <button @click="addSentenceToGroup" class="btn-primary flex-1">添加</button>
                    <button @click="showAddModal = false" class="btn-secondary flex-1">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    sentences: any[];
    groupId: number;
}>();

const emit = defineEmits(['refresh']);

const showAddModal = ref(false);
const selectedSentenceId = ref('');
const mySentences = ref<any[]>([]);

import { formatDateOnly } from '@/utils/time';
function formatDate(date: string): string {
    return formatDateOnly(date)
    // → '2026-09-08'
}

function likeSentence(id: number) {
    // TODO: 实现点赞
}

async function addSentenceToGroup() {
    // TODO: 实现添加到小组
}
</script>