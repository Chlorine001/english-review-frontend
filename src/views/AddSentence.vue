<template>
    <div class="max-w-xl mx-auto p-4 pb-32 overflow-y-auto h-screen">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">添加句子</h2>
        <form @submit.prevent="submit">
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">英文句子 <span
                        class="text-red-500 dark:text-red-400">*</span></label>
                <div class="flex items-start gap-2">
                    <textarea v-model="form.content" rows="3" class="textarea-field" required></textarea>
                    <!-- <button type="button" @click="speak(form.content)"
                        class="mt-1 text-2xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">🔊</button> -->
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">中文含义</label>
                <input v-model="form.translation" class="input-field" />
            </div>

            <!-- 发音/音标（带自动获取按钮） -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">发音/音标</label>
                <div class="flex gap-2">
                    <input v-model="form.pronunciation" class="input-field" placeholder="例如 /ˈwʌndərɪŋ/ 或留空" />
                    <!-- <button type="button" @click="fetchPhonetic"
                        class="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-sm whitespace-nowrap btn-secondary"
                        :disabled="isFetching">
                        {{ isFetching ? '查询中...' : '📖 获取音标' }}
                    </button> -->
                </div>
                <!-- <p class="text-xs text-gray-400 mt-1">仅对单个单词有效，长句可能查询不到</p> -->
            </div>

            <!-- 备注 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">备注</label>
                <textarea v-model="form.notes" rows="2" class="input-field"></textarea>
            </div>

            <!-- 来源 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">来源</label>
                <input v-model="form.source" class="input-field" />
            </div>

            <!-- 提交按钮区域 -->
            <div class="flex gap-4 mt-8">
                <button type="submit" class="flex-1 btn-primary" :disabled="submitting">
                    {{ submitting ? '保存中...' : '保存' }}
                </button>
                <button type="button" class="flex-1 btn-secondary" @click="router.push('/')" :disabled="submitting">
                    取消
                </button>
            </div>
        </form>

        <!-- ====== 上传音频模态框 ====== -->
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">📢 上传媒体（可选）</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    为句子添加媒体，方便深刻理解。
                </p>
                <!-- 隐藏的文件输入 -->
                <input ref="modalFileInput" type="file" :accept="MEDIA_ACCEPT"
                    @change="handleModalFileSelect" class="hidden" />
                <!-- 自定义选择按钮 -->
                <button type="button" @click="modalFileInput?.click()"
                    class="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-gray-500 dark:text-gray-400"
                    :disabled="uploadingFile">
                    📁 选择媒体文件
                </button>
                <!-- 已选文件信息 -->
                <div v-if="selectedFile" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    📄 {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
                </div>
                <div v-else class="mt-2 text-sm text-gray-400">
                    未选择任何文件
                </div>

                <!-- 进度条 -->
                <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-3">
                    <progress :value="uploadProgress" max="100" class="w-full" />
                    <p class="text-xs text-gray-500 text-center">{{ uploadProgress }}%</p>
                </div>

                <!-- 上传成功状态 -->
                <div v-if="uploaded" class="mt-2 text-green-600 dark:text-green-400 text-sm">
                    ✅ 上传成功
                </div>
                <div class="flex gap-2 mt-4">
                    <button @click="triggerModalUpload" class="flex-1 btn-primary"
                        :disabled="uploadingFile || uploaded || !selectedFile">
                        {{ uploadingFile ? '上传中...' : uploaded ? '✅ 已上传' : '上传' }}
                    </button>
                    <button @click="skipUpload" class="flex-1 btn-secondary" :disabled="uploadingFile">
                        {{ uploaded ? '完成' : '跳过' }}
                    </button>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
// import { useTTS } from '../composables/useTTS';
import { ALLOWED_MEDIA_TYPES, ALLOWED_MEDIA_EXTS, DEFAULT_MAX_FILE_SIZE, MEDIA_ACCEPT } from '@/constants';

const router = useRouter();
const form = reactive({
    content: '',
    translation: '',
    pronunciation: '',
    notes: '',
    source: '',
});
// const isFetching = ref(false);
const newSentenceId = ref<number | null>(null);
const selectedFile = ref<File | null>(null);
const uploadProgress = ref(0);
const uploaded = ref(false);

const showUploadModal = ref(false);
const modalFileInput = ref<HTMLInputElement | null>(null);
const uploadingFile = ref(false);

const submitting = ref(false);
// // TTS 发音
// const { speak } = useTTS();

// // 📖 获取音标（调用后端词典 API）
// async function fetchPhonetic() {
//     const word = form.content.trim();
//     if (!word) {
//         alert('请先输入英文句子/单词');
//         return;
//     }
//     // 如果包含空格，只取第一个单词（简单处理）
//     const firstWord = word.split(/\s+/)[0];
//     if (!firstWord) return;

//     isFetching.value = true;
//     try {
//         const res = await fetch(`/api/dictionary/${encodeURIComponent(firstWord)}`);
//         const data = await res.json();
//         if (data.phonetic) {
//             form.pronunciation = data.phonetic;
//         } else {
//             alert('未找到该单词的音标，请手动输入');
//         }
//     } catch (e) {
//         alert('音标查询失败，请手动输入');
//     } finally {
//         isFetching.value = false;
//     }
// }

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
        // 打开模态框（提交按钮保持禁用）
        showUploadModal.value = true;
        uploaded.value = false;
        uploadProgress.value = 0;
        selectedFile.value = null;
        if (modalFileInput.value) modalFileInput.value.value = '';
    } catch (e: any) {
        alert('❌ 保存失败：' + (e.message || '未知错误'));
        submitting.value = false; // 失败则解锁
    }
}

// ===== 模态框上传逻辑 =====
async function uploadMedia() {
    if (!selectedFile.value || !newSentenceId.value) return;

    uploadingFile.value = true;
    uploadProgress.value = 0;
    uploaded.value = false;

    try {
        await api.uploadMedia(newSentenceId.value, selectedFile.value, (p) => {
            uploadProgress.value = p;
        });
        uploaded.value = true;
        alert('✅ 音频上传成功！');
    } catch (e: any) {
        alert('❌ 音频上传失败：' + (e.message || '未知错误'));
    } finally {
        uploadingFile.value = false;
    }
}

function handleModalFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
        input.value = '';
        return;
    }

    const file = input.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_MEDIA_TYPES.includes(file.type) || !ext || !ALLOWED_MEDIA_EXTS.includes(ext)) {
        alert(`仅支持 ${ALLOWED_MEDIA_EXTS.join(', ')} 格式`);
        input.value = '';
        return;
    }
    if (file.size > DEFAULT_MAX_FILE_SIZE) {
        alert(`文件大小不能超过 ${DEFAULT_MAX_FILE_SIZE / 1024 / 1024}MB`);
        input.value = '';
        return;
    }


    selectedFile.value = input.files[0];
    // 允许再次选择同一个文件
    input.value = '';
}

function triggerModalUpload() {
    // 条件：未在上传中、尚未上传成功、且已选文件
    if (uploadingFile.value || uploaded.value || !selectedFile.value) {
        return;
    }
    // 开始上传
    uploadMedia();
    // modalFileInput.value?.click();
}

function skipUpload() {
    showUploadModal.value = false;
    submitting.value = false; // 解锁提交按钮
    router.push('/');
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