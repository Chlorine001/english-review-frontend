<template>
    <div class="max-w-4xl mx-auto p-4 pb-24 overflow-y-auto h-screen">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">📖 句子库</h2>
            <div class="flex flex-wrap gap-2">
                <input v-model="searchQuery" @input="loadSentences" placeholder="搜索句子..."
                    class="input-field w-40 sm:w-auto" />
                <select v-model="sortOrder" @change="loadSentences" class="input-field w-32 sm:w-auto">
                    <option value="created_at_desc">最新添加</option>
                    <option value="created_at_asc">最早添加</option>
                    <option value="content_asc">按句子 A-Z</option>
                    <option value="content_desc">按句子 Z-A</option>
                </select>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="text-gray-500 dark:text-gray-400">加载中...</div>
        <div v-else-if="sentences.length === 0" class="text-gray-500 dark:text-gray-400">还没有句子，去添加一些吧！</div>

        <!-- 句子列表 -->
        <div v-else class="space-y-4">
            <div v-for="sentence in sentences" :key="sentence.id" class="card p-4 hover:shadow-md transition">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="card-title">{{ sentence.content }}</p>
                        <p class="card-text" v-if="sentence.translation">{{ sentence.translation }}</p>
                        <div class="card-meta mt-1">
                            <span v-if="sentence.pronunciation">/{{ sentence.pronunciation }}/</span>
                            <span v-if="sentence.source" class="ml-2">来源：{{ sentence.source }}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 ml-4">
                        <button @click="editSentence(sentence)"
                            class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm">
                            ✏️
                        </button>
                        <button @click="deleteSentence(sentence.id)"
                            class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm">
                            🗑️
                        </button>
                    </div>
                </div>
                <!-- 音频播放器独立一行（在 flex 容器外） -->
                <div v-if="sentence.audio_path" class="mt-3">
                    <audio controls :src="audioUrls[sentence.id]" crossorigin="use-credentials" class="w-full" />
                </div>
            </div>
        </div>

        <!-- 编辑对话框 -->
        <div v-if="editingSentence"
            class="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center p-4 z-50">
            <div class="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">✏️ 编辑句子</h3>

                <!-- 原有表单字段 -->
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">英文句子 *</label>
                        <textarea v-model="editForm.content" rows="2" class="textarea-field"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">中文含义</label>
                        <input v-model="editForm.translation" class="input-field" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">发音/音标</label>
                        <input v-model="editForm.pronunciation" class="input-field" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">备注</label>
                        <textarea v-model="editForm.notes" rows="2" class="textarea-field"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">来源</label>
                        <input v-model="editForm.source" class="input-field" />
                    </div>
                </div>

                <!-- ====== 音频管理区域（与 AddSentence 风格一致） ====== -->
                <!-- ====== 音频管理区域（优化布局版） ====== -->
                <div class="border-t pt-4 mt-4">
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📢 音频文件</h4>

                    <!-- 情况 1：已有音频 -->
                    <div v-if="editForm.audio_path">
                        <div class="flex flex-col gap-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                            <!-- 播放器 -->
                            <audio controls :src="audioUrls[editForm.id]" class="w-full h-10" />
                            <!-- 文件名 -->
                            <span class="text-sm text-gray-600 dark:text-gray-300 text-center truncate">
                                {{ editForm.audio_original_name || editForm.audio_path?.split('/').pop() || '音频' }}
                            </span>
                            <!-- 操作按钮组 -->
                            <div class="flex justify-center gap-2">
                                <button @click="removeAudio"
                                    class="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    🗑️ 删除
                                </button>
                                <button type="button" @click="editFileInput?.click()"
                                    class="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 border border-indigo-300 dark:border-indigo-700 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    :disabled="editUploading">
                                    🔄 替换
                                </button>
                            </div>
                        </div>

                        <!-- 替换时显示的文件选择（隐藏） -->
                        <input ref="editFileInput" type="file" accept="audio/*" @change="handleEditFileSelect"
                            class="hidden" />
                    </div>

                    <!-- 情况 2：无音频 -->
                    <div v-else>
                        <input ref="editFileInput" type="file" accept="audio/*" @change="handleEditFileSelect"
                            class="hidden" />
                        <button type="button" @click="editFileInput?.click()"
                            class="w-full py-3 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            :disabled="editUploading">
                            📁 点击选择音频文件
                        </button>
                    </div>

                    <!-- 已选文件信息（替换或无音频时显示） -->
                    <div v-if="editSelectedFile && !editForm.audio_path"
                        class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        📄 {{ editSelectedFile.name }} ({{ (editSelectedFile.size / 1024).toFixed(1) }} KB)
                    </div>

                    <!-- 进度条 -->
                    <div v-if="editUploadProgress > 0 && editUploadProgress < 100" class="mt-2">
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                :style="{ width: editUploadProgress + '%' }"></div>
                        </div>
                        <p class="text-xs text-gray-500 text-center mt-1">{{ editUploadProgress }}%</p>
                    </div>

                    <!-- 上传成功状态 -->
                    <div v-if="editUploaded" class="mt-2 text-green-600 dark:text-green-400 text-sm">
                        ✅ 上传成功
                    </div>

                    <!-- 上传按钮（仅在选择了文件且未上传时显示） -->
                    <div v-if="editSelectedFile && !editUploaded" class="mt-3">
                        <button @click="triggerEditUpload" class="btn-primary w-full" :disabled="editUploading">
                            {{ editUploading ? '上传中...' : '⬆️ 上传音频' }}
                        </button>
                    </div>
                </div>
                <!-- 对话框底部按钮 -->
                <div class="flex justify-end gap-2 mt-4 border-t pt-4">
                    <button @click="saveEdit" class="btn-primary" :disabled="editUploading">保存</button>
                    <button @click="closeEdit" class="btn-secondary" :disabled="editUploading">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

// 类型定义
interface Sentence {
    id: number;
    content: string;
    translation?: string;
    pronunciation?: string;
    notes?: string;
    source?: string;
    audio_path?: string | null;
    audio_format?: string | null;
    audio_duration?: number | null;
    audio_original_name: string | null,
}

// 状态
const sentences = ref<any[]>([]);
const editForm = ref<Sentence>({
    id: 0,
    content: '',
    translation: '',
    pronunciation: '',
    notes: '',
    source: '',
    audio_path: null,
    audio_format: null,
    audio_duration: null,
    audio_original_name: null,
});

const loading = ref(false);
const searchQuery = ref('');
const sortOrder = ref('created_at_desc');

const editingSentence = ref(false);

async function loadSentences() {
    loading.value = true;
    try {
        const params: any = { sort: sortOrder.value };
        if (searchQuery.value) params.search = searchQuery.value;
        sentences.value = await api.getSentences(params);
        loadAudioForSentences()
    } catch (e) {
        console.error('加载句子失败', e);
    } finally {
        loading.value = false;
    }
}

// 编辑函数
function editSentence(sentence: any) {
    editForm.value = { ...sentence };
    editingSentence.value = true;
}

function closeEdit() {
    editingSentence.value = false;
    editUploaded.value = false;
    editSelectedFile.value = null;
}

async function saveEdit() {
    try {
        await api.updateSentence(editForm.value.id, editForm.value);
        await loadSentences();
        closeEdit();
    } catch (e) {
        alert('更新失败');
    }
}


async function deleteSentence(id: number) {
    if (!confirm('确定要删除这个句子吗？')) return;
    try {
        // 1️⃣ 先尝试删除音频（如果有）
        try {
            await api.deleteAudio(id);
        } catch (audioError: any) {
            // 如果音频不存在（404），视为正常，继续删除句子
            // 注意：根据你的 API 返回，404 可能表现为错误消息包含 '404' 或状态码
            if (audioError.message?.includes('No audio to delete') || audioError.status === 404) {
                // 音频不存在，忽略
            } else {
                // 其他错误（如网络、权限等），停止删除
                throw new Error('删除音频失败：' + (audioError.message || '未知错误'));
            }
        }

        // 2️⃣ 删除句子
        await api.deleteSentence(id);

        // 3️⃣ 刷新列表
        await loadSentences();

        // 4️⃣ 如果当前编辑的正是被删除的句子，关闭编辑对话框
        if (editForm.value.id === id) {
            closeEdit();
        }

        alert('✅ 删除成功');
    } catch (e: any) {
        alert('❌ 删除失败：' + (e.message || '未知错误'));
    }
}
const audioUrls = ref<Record<number, string>>({});

// 在加载句子列表后，为每个句子加载音频（可选，可延迟加载）
function loadAudioForSentences() {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    sentences.value.forEach(s => {
        audioUrls.value[s.id] = `${baseURL}/api/sentences/${s.id}/audio`;
    });
}

// 音频编辑相关
const editFileInput = ref<HTMLInputElement | null>(null);
const editSelectedFile = ref<File | null>(null);
const editUploading = ref(false);
const editUploadProgress = ref(0);
const editUploaded = ref(false);


async function triggerEditUpload() {
    if (!editSelectedFile.value || !editForm.value.id) return;
    editUploading.value = true;
    editUploadProgress.value = 0;
    editUploaded.value = false;

    try {
        await api.uploadAudio(editForm.value.id, editSelectedFile.value, (p) => {
            editUploadProgress.value = p;
        });
        editUploaded.value = true;
        alert('✅ 音频上传成功！');
        // 刷新句子列表，更新 audio_path
        await loadSentences();
        const updated = sentences.value.find(s => s.id === editForm.value.id);
        if (updated) {
            editForm.value = { ...updated };
        }
        editSelectedFile.value = null;
        if (editFileInput.value) editFileInput.value.value = '';
    } catch (e: any) {
        alert('❌ 音频上传失败：' + (e.message || '未知错误'));
    } finally {
        editUploading.value = false;
    }
}

// 处理文件选择
function handleEditFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
        input.value = '';
        return;
    }
    editSelectedFile.value = input.files[0];
    input.value = ''; // 允许重复选择同一文件
    editUploaded.value = false;
    editUploadProgress.value = 0;
}

async function removeAudio() {
    if (!confirm('确定删除该音频吗？')) return;
    try {
        await api.deleteAudio(editForm.value.id);
        await loadSentences();
        const updated = sentences.value.find(s => s.id === editForm.value.id);
        if (updated) {
            editForm.value = { ...updated };
        }
        editUploaded.value = false;
        alert('✅ 音频已删除');
    } catch (e: any) {
        alert('❌ 删除失败：' + (e.message || '未知错误'));
    }
}

onMounted(loadSentences);

</script>