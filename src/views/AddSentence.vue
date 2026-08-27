<template>
    <div class="max-w-xl mx-auto p-4 pb-24 overflow-y-auto h-screen">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">添加句子</h2>
        <form @submit.prevent="submit">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">英文句子 <span
                        class="text-red-500 dark:text-red-400">*</span></label>
                <div class="flex items-start gap-2">
                    <textarea v-model="form.content" rows="3" class="textarea-field" required></textarea>
                    <button type="button" @click="speak(form.content)"
                        class="mt-1 text-2xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">🔊</button>
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">中文含义</label>
                <input v-model="form.translation" class="input-field" />
            </div>


            <!-- 发音/音标（带自动获取按钮） -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 mb-1">发音/音标</label>
                <div class="flex gap-2">
                    <input v-model="form.pronunciation" class="input-field" placeholder="例如 /ˈwʌndərɪŋ/ 或留空" />
                    <button type="button" @click="fetchPhonetic"
                        class="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm whitespace-nowrap btn-secondary"
                        :disabled="isFetching">
                        {{ isFetching ? '查询中...' : '📖 获取音标' }}
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-1">仅对单个单词有效，长句可能查询不到</p>
            </div>

            <!-- 备注 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 mb-1">备注</label>
                <textarea v-model="form.notes" rows="2" class="input-field"></textarea>
            </div>

            <!-- 来源 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 mb-1">来源</label>
                <input v-model="form.source" class="input-field" />
            </div>

            <!-- 提交按钮区域 -->
            <div class="flex gap-4 mt-8">
                <button type="submit" class="flex-1 btn-primary" :disabled="submitting">
                    {{ submitting ? '保存中...' : '保存' }}
                </button>
                <button type="button" class="flex-1 btn-secondary" @click="$router.push('/')" :disabled="submitting">
                    取消
                </button>
            </div>
        </form>

        <!-- 隐藏的文件选择器（保存后弹出） -->
        <input ref="fileInput" type="file" accept="audio/*" @change="handleFileSelect" class="hidden" />

        <!-- 上传进度与状态 -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-4">
            <progress :value="uploadProgress" max="100" class="w-full" />
        </div>
        <div v-if="uploaded" class="mt-2 text-green-600 dark:text-green-400">✅ 音频上传成功</div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
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
const newSentenceId = ref<number | null>(null);
const selectedFile = ref<File | null>(null);
const uploadProgress = ref(0);
const uploaded = ref(false);
const audioUrl = ref('');

const showUploadModal = ref(false);
const modalFileInput = ref<HTMLInputElement | null>(null);
const uploadingFile = ref(false);

// 引用隐藏的文件输入
const fileInput = ref<HTMLInputElement | null>(null);
const submitting = ref(false);
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
    // 如果正在提交，直接返回
    if (submitting.value) return;

    // 简单校验
    if (!form.content.trim()) {
        alert('请输入英文句子');
        return;
    }

    submitting.value = true;
    try {
        const result = await api.addSentence(form);
        newSentenceId.value = result.id;
        // 保存成功提示
        alert('✅ 句子保存成功！');
        
        // 弹出音频上传选择器
        await nextTick();
        triggerFilePicker();
    } catch (e: any) {
        alert('❌ 保存失败：' + (e.message || '未知错误'));
    } finally {
        submitting.value = false;
    }
}

function triggerFilePicker() {
    // 如果用户确认上传，则触发文件选择
    if (confirm('句子已保存！是否现在上传音频？\n（点击“确定”选择音频文件，取消则跳过）')) {
        fileInput.value?.click();
    }
}

function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
        // 用户取消选择，重置 input 以便再次触发
        input.value = '';
        return;
    }
    selectedFile.value = input.files[0];
    uploadAudio();
    // 重置 input 值，以便下次选择同一个文件也能触发 change
    input.value = '';
}

async function uploadAudio() {
    if (!selectedFile.value || !newSentenceId.value) return;
    uploadProgress.value = 0;
    uploaded.value = false;
    try {
        await api.uploadAudio(newSentenceId.value, selectedFile.value, (p) => {
            uploadProgress.value = p;
        });
        uploaded.value = true;

        // 可选：加载音频 URL 以便播放
        await loadAudioUrl();
    } catch (e: any) {
        alert('上传失败：' + e.message);
    }
}

async function loadAudioUrl() {
    if (!newSentenceId.value) return;
    try {
        const { url } = await api.getAudioUrl(newSentenceId.value);
        audioUrl.value = url;
    } catch {
        // 没有音频，忽略
    }
}
</script>

<style scoped>
/* 确保页面滚动条可见 */
.h-screen {
    height: 100vh;
}

.overflow-y-auto {
    overflow-y: auto;
}
</style>