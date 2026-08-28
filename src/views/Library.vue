<template>
    <div class="max-w-4xl mx-auto p-4">
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

        <!-- 编辑对话框（模态框） -->
        <div v-if="editingSentence"
            class="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center p-4">
            <div class="card p-6 max-w-lg w-full">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">编辑句子</h3>
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
                <div class="flex justify-end gap-2 mt-4">
                    <button @click="closeEdit"
                        class="px-4 py-2 border border-gray-300 dark:border-[#3d3f5e] rounded hover:bg-gray-50 dark:hover:bg-[#3d3f5e] text-gray-700 dark:text-gray-300">取消</button>
                    <button @click="saveEdit" class="btn-primary">保存</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

const sentences = ref<any[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const sortOrder = ref('created_at_desc');

const editingSentence = ref(false);
const editForm = ref({ id: 0, content: '', translation: '', pronunciation: '', notes: '', source: '' });

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

function editSentence(sentence: any) {
    editForm.value = { ...sentence };
    editingSentence.value = true;
}

function closeEdit() {
    editingSentence.value = false;
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
        await api.deleteSentence(id);
        await loadSentences();
    } catch (e) {
        alert('删除失败');
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

onMounted(loadSentences);

</script>