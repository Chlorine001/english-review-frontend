<template>
    <div class="max-w-xl mx-auto p-4">
        <h2 class="text-2xl font-bold mb-4">添加句子</h2>
        <form @submit.prevent="submit">
            <!-- 英文句子 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">英文句子 *</label>
                <div class="flex items-start gap-2">
                    <textarea v-model="form.content" rows="3" class="flex-1 border rounded px-3 py-2"
                        required></textarea>
                    <button type="button" @click="speak(form.content)"
                        class="mt-1 text-2xl hover:text-indigo-600 transition-colors" title="朗读句子">
                        🔊
                    </button>
                </div>
            </div>

            <!-- 中文含义 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">中文含义</label>
                <input v-model="form.translation" class="w-full border rounded px-3 py-2" />
            </div>

            <!-- 发音/音标（带自动获取按钮） -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">发音/音标</label>
                <div class="flex gap-2">
                    <input v-model="form.pronunciation" class="flex-1 border rounded px-3 py-2"
                        placeholder="例如 /ˈwʌndərɪŋ/ 或留空" />
                    <button type="button" @click="fetchPhonetic"
                        class="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm whitespace-nowrap"
                        :disabled="isFetching">
                        {{ isFetching ? '查询中...' : '📖 获取音标' }}
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-1">仅对单个单词有效，长句可能查询不到</p>
            </div>

            <!-- 备注 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">备注</label>
                <textarea v-model="form.notes" rows="2" class="w-full border rounded px-3 py-2"></textarea>
            </div>

            <!-- 来源 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">来源</label>
                <input v-model="form.source" class="w-full border rounded px-3 py-2" />
            </div>

            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                保存
            </button>
            <router-link to="/" class="ml-4 text-gray-600 underline">取消</router-link>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { useTTS } from '../composables/useTTS';

const router = useRouter();
const form = reactive({
    content: '',
    translation: '',
    pronunciation: '',
    notes: '',
    source: '',
});
const isFetching = ref(false);

// TTS 发音
const { speak } = useTTS();

// 📖 获取音标（调用后端词典 API）
async function fetchPhonetic() {
    const word = form.content.trim();
    if (!word) {
        alert('请先输入英文句子/单词');
        return;
    }
    // 如果包含空格，只取第一个单词（简单处理）
    const firstWord = word.split(/\s+/)[0];
    if (!firstWord) return;

    isFetching.value = true;
    try {
        const res = await fetch(`/api/dictionary/${encodeURIComponent(firstWord)}`);
        const data = await res.json();
        if (data.phonetic) {
            form.pronunciation = data.phonetic;
        } else {
            alert('未找到该单词的音标，请手动输入');
        }
    } catch (e) {
        alert('音标查询失败，请手动输入');
    } finally {
        isFetching.value = false;
    }
}

async function submit() {
    try {
        await api.addSentence(form);
        router.push('/');
    } catch (e: any) {
        alert(e.message || '保存失败');
    }
}
</script>