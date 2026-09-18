<template>
    <div class="max-w-xl mx-auto p-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">添加句子</h2>
        <!-- ✅ 模式切换 -->
        <div class="flex gap-2 mb-4">
            <button type="button" @click="switchMode('manual')"
                class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors" :class="mode === 'manual'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                ✍️ 手动输入
            </button>
            <button type="button" @click="switchMode('ai')"
                class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors" :class="mode === 'ai'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                🤖 AI 识别
            </button>
        </div>
        <!-- ✅ AI 识别模式 -->
        <div v-if="mode === 'ai'" class="card p-6 mb-4">
            <h3 class="text-base font-medium text-gray-900 dark:text-white mb-2">
                🤖 AI 自动识别
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
                上传音频或视频，AI 将自动识别文本并翻译。
            </p>

            <!-- 上传区 -->
            <div v-if="!aiFile"
                class="border-2 border-dashed border-indigo-400 dark:border-indigo-600 rounded-lg p-8 text-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                @click="aiFileInput?.click()" @dragover.prevent @drop.prevent="handleAIDrop">
                <div class="text-4xl mb-2">🎙️</div>
                <p class="text-sm text-gray-700 dark:text-gray-300 font-medium">点击或拖拽上传</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    支持 MP3、WAV、M4A、MP4 等格式
                </p>
            </div>
            <input ref="aiFileInput" type="file" :accept="MEDIA_ACCEPT" class="hidden" @change="handleAISelect" />

            <!-- 已选文件 -->
            <div v-if="aiFile" class="space-y-3">
                <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                    <div class="min-w-0 flex-1">
                        <p class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ aiFile.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {{ formatFileSize(aiFile.size) }}
                        </p>
                    </div>
                    <button @click="clearAll" :disabled="analyzing || !!aiResult"
                        class="text-xs text-gray-500 hover:text-red-500 ml-2 flex-shrink-0">
                        ✕ 移除
                    </button>
                </div>

                <!-- 识别按钮 -->
                <button v-if="!aiResult" @click="startAIAnalyze" :disabled="analyzing"
                    class="btn-primary w-full py-3 text-sm disabled:opacity-50">
                    {{ analyzing ? `识别中... ${aiProgress}%` : '🎯 开始识别' }}
                </button>

                <!-- 识别进度 -->
                <div v-if="analyzing" class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div class="bg-indigo-600 h-2 rounded-full transition-all" :style="{ width: aiProgress + '%' }">
                    </div>
                </div>

                <!-- 识别结果 -->
                <div v-if="aiResult" class="space-y-3">
                    <div
                        class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <p class="text-xs text-green-700 dark:text-green-300 mb-2">✅ 识别完成</p>
                        <p class="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {{ aiResult.text }}
                        </p>
                    </div>

                    <!-- 应用到表单 -->
                    <button v-if="!modify" @click="applyAIResult" class="btn-primary w-full py-3 text-sm"
                        :disabled="modify">
                        ✨ 应用到表单
                    </button>

                    <!-- 重新识别 -->
                    <button @click="clearAll" :disabled="submitting || scentenceSuccess"
                        class="btn-secondary w-full py-2 text-sm">
                        🔄 重新上传
                    </button>
                </div>
            </div>
        </div>
        <form v-if="(modify && mode === 'ai') || mode === 'manual'" @submit.prevent="submit" class="card p-6">
            <fieldset :disabled="submitting || scentenceSuccess" class="space-y-0">

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">英文句子 <span
                            class="text-red-500 dark:text-red-400">*</span></label>
                    <div class="flex items-start gap-2">
                        <textarea v-model="form.content" rows="3" class="textarea-field" required></textarea>
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">中文含义</label>
                    <input v-model="form.translation" class="input-field" />
                </div>

                <!-- 发音/音标 -->
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">发音/音标</label>
                    <div class="flex gap-2">
                        <input v-model="form.pronunciation" class="input-field" placeholder="例如 /ˈwʌndərɪŋ/ 或留空" />
                    </div>
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
            </fieldset>
            <!-- 提交按钮区域 -->
            <div class="flex gap-4 mt-8">
                <button type="submit" class="flex-1 btn-primary" :disabled="submitting || scentenceSuccess">
                    {{ scentenceSuccess ? '✅保存成功' : submitting ? '保存中...' : '保存' }}
                </button>
                <button type="button" class="flex-1 btn-secondary" @click="router.push('/')"
                    :disabled="submitting && !scentenceSuccess">
                    {{ scentenceSuccess ? '完成' : '取消' }}
                </button>
            </div>
        </form>

        <!-- ====== 上传音频模态框 ====== -->
        <div v-if="mode === 'manual' && showUploadModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">📢 上传媒体（可选）</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    为句子添加媒体，方便深刻理解。
                </p>
                <!-- 隐藏的文件输入 -->
                <input ref="modalFileInput" type="file" :accept="MEDIA_ACCEPT" @change="handleModalFileSelect"
                    class="hidden" />
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
import { ALLOWED_MEDIA_TYPES, ALLOWED_MEDIA_EXTS, DEFAULT_MAX_FILE_SIZE, MEDIA_ACCEPT } from '@/constants';
import { confirm } from '@/utils/verifyCheck';

const router = useRouter();
const form = reactive({
    content: '',
    translation: '',
    pronunciation: '',
    notes: '',
    source: '',
});

// ===== 状态 =====
const submitting = ref(false);
const scentenceSuccess = ref(false);
const aiMediaSuccess = ref(false);
const newSentenceId = ref<number | null>(null);
const selectedFile = ref<File | null>(null);
const uploadProgress = ref(0);
const uploaded = ref(false);
const showUploadModal = ref(false);
const modalFileInput = ref<HTMLInputElement | null>(null);
const uploadingFile = ref(false);

// ===== 模式 =====
const mode = ref<'manual' | 'ai'>('manual');

// ===== AI 识别相关 =====
const aiFileInput = ref<HTMLInputElement | null>(null);
const aiFile = ref<File | null>(null);
const aiResult = ref<{ text: string; translation?: string } | null>(null);
const analyzing = ref(false);
const aiProgress = ref(0);

// ===== AI 文件选择 =====
function handleAISelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    validateAndSetAIFile(input.files[0]);
    input.value = '';
}

async function handleAIDrop(e: DragEvent) {
    const f = e.dataTransfer?.files[0];
    if (!f) return;
    await validateAndSetAIFile(f);
}

async function validateAndSetAIFile(f: File): Promise<boolean> {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_MEDIA_EXTS.includes(ext)) {
        await confirm({
            title: '警告',
            message: `仅支持 ${ALLOWED_MEDIA_EXTS.join(', ')} 格式`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return false;
    }
    if (f.size > DEFAULT_MAX_FILE_SIZE) {
        await confirm({
            title: '警告',
            message: `文件大小不能超过 ${DEFAULT_MAX_FILE_SIZE / 1024 / 1024}MB`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return false;
    }
    aiFile.value = f;
    aiResult.value = null;
    return true;
}

// ===== 开始 AI 识别 =====
async function startAIAnalyze() {
    if (!aiFile.value) return;

    // 检查邮箱验证
    const isVerified = localStorage.getItem('isVerified') === 'true';
    if (!isVerified) {
        const ok = await confirm({
            title: '邮箱未验证',
            message: 'AI 识别功能需要验证邮箱，是否前往验证？',
            icon: '📧',
            confirmText: '前往验证',
            cancelText: '取消',
        });
        if (ok) {
            const email = localStorage.getItem('userEmail') || '';
            router.push({ path: '/verify-email', query: { email } });
        }
        return;
    }

    analyzing.value = true;
    aiProgress.value = 0;

    try {
        // ✅ 调用后端 AI 接口
        const result = await api.analyzeMedia(aiFile.value, (p) => {
            aiProgress.value = p;
        });

        aiResult.value = {
            text: result.text,
            translation: result.translation,
        };
    } catch (e: any) {
        await confirm({
            title: '识别失败',
            message: e.message || 'AI 识别失败，请重试',
            icon: '❌',
            confirmText: '我知道了',
            onlyOne: true,
        });
    } finally {
        analyzing.value = false;
    }
}

const modify = ref(false);
// ===== 应用 AI 结果到表单 =====
function applyAIResult() {
    if (!aiResult.value) return;
    form.content = aiResult.value.text;
    if (aiResult.value.translation) {
        form.translation = aiResult.value.translation;
    }
    modify.value = true;
    // 提示用户
    confirm({
        title: '已应用',
        message: '识别结果已填入表单，请检查并修改后提交。',
        icon: '✅',
        confirmText: '好的',
        onlyOne: true,
    });
}

async function switchMode(newMode: 'manual' | 'ai') {
    if (newMode === mode.value) return;
    if (newMode === 'ai') {
        // ✅ 检查邮箱是否已验证
        const isVerified = localStorage.getItem('isVerified') === 'true';
        if (!isVerified) {
            const confirmed = await confirm({
                title: '邮箱未验证',
                message: '需要验证邮箱后才能使用 AI 识别功能，是否前往验证？',
                icon: '📧',
                confirmText: '前往验证',
                cancelText: '取消',
            });
            if (confirmed) {
                const email = localStorage.getItem('userEmail') || '';
                router.push({ path: '/verify-email', query: { email } });
            }
            return;
        }
    }

    // 有数据时提示
    const hasData = form.content.trim() || aiFile.value;
    if (hasData) {
        const ok = await confirm({
            title: '切换模式',
            message: '切换模式会清空当前填写的内容和附件，是否继续？',
            icon: '⚠️',
            confirmText: '继续',
            cancelText: '取消',
        });
        if (!ok) return;
    }

    // ✅ 清空所有状态
    clearAll();

    // 切换模式
    mode.value = newMode;
}

// ✅ 统一清空
function clearAll() {
    // 清空表单
    form.content = '';
    form.translation = '';
    form.pronunciation = '';
    form.notes = '';
    form.source = '';

    // 清空附件
    aiFile.value = null;
    selectedFile.value = null;
    aiResult.value = null;

    // 清空状态
    newSentenceId.value = null;
    uploadProgress.value = 0;
    aiProgress.value = 0;
    uploaded.value = false;
    analyzing.value = false;
    submitting.value = false;
    scentenceSuccess.value = false;
    modify.value = false;
    aiMediaSuccess.value = false;
}

//============提交========
async function submit() {
    // 如果正在提交，直接返回
    if (submitting.value) return;

    // 简单校验
    if (!form.content.trim()) {
        await confirm({
            title: '警告',
            message: "请输入英文句子！",
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return;
    }

    submitting.value = true;
    try {
        const result = await api.addSentence(form);
        newSentenceId.value = result.id;
        scentenceSuccess.value = true;
        if (mode.value === 'ai') {
            await uploadInAIMode(newSentenceId.value);
        } else {
            // 保存成功提示
            await confirm({
                title: '保存成功',
                message: "句子保存成功！",
                icon: '✅',
                confirmText: '我知道了',
                onlyOne: true,
            });
            // 打开模态框（提交按钮保持禁用）
            showUploadModal.value = true;
            uploaded.value = false;
            uploadProgress.value = 0;
            selectedFile.value = null;
            if (modalFileInput.value) modalFileInput.value.value = '';
        }

    } catch (e: any) {
        await confirm({
            title: '保存失败',
            message: (e.message || '未知错误'),
            icon: '❌',
            confirmText: '我知道了',
            onlyOne: true,
        });
        scentenceSuccess.value = false;
        aiMediaSuccess.value = false;
        submitting.value = false; // 失败则解锁
    }
}

// ===== 模态框上传逻辑 =====AI上传附件
async function uploadInAIMode(newSentenceId: number) {
    const file = aiFile.value;
    if (!file) {
        clearAll();
        await confirm({
            title: '媒体文件丢失',
            message: ('AI识别的媒体文件丢失，请重新上传！'),
            icon: '❌',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return;
    }

    let attempt = 0;

    while (true) {
        attempt++;
        try {
            if (!aiFile.value) return;
            await api.uploadMedia(newSentenceId, file, (p) => {
                uploadProgress.value = p;
            });
            // 保存成功提示
            await confirm({
                title: '保存成功',
                message: "句子保存成功！",
                icon: '✅',
                confirmText: '我知道了',
                onlyOne: true,
            });
            submitting.value = false;
            uploaded.value = true;
            aiMediaSuccess.value = true;
            return;
        } catch (e: any) {
            const retry = await confirm({
                title: `媒体文件上传失败（第 ${attempt} 次）`,
                message: `${e.message || '未知错误'}\n\n是否重试？`,
                icon: '❌',
                confirmText: '重试',
                cancelText: '放弃',
            });
            if (!retry) {
                // 用户放弃
                aiMediaSuccess.value = false;
                submitting.value = false;
                return;
            }
        }
    }
}

// ===== 模态框上传逻辑 =====手工录入上传附件
async function uploadMedia() {
    if (!selectedFile.value || !newSentenceId.value) return;

    // ✅ 检查邮箱是否已验证
    const isVerified = localStorage.getItem('isVerified') === 'true';
    if (!isVerified) {
        const confirmed = await confirm({
            title: '邮箱未验证',
            message: '需要验证邮箱后才能上传音频，是否前往验证？',
            icon: '📧',
            confirmText: '前往验证',
            cancelText: '取消',
        });
        if (confirmed) {
            const email = localStorage.getItem('userEmail') || '';
            router.push({ path: '/verify-email', query: { email } });
        }
        return;
    }

    uploadingFile.value = true;
    uploadProgress.value = 0;
    uploaded.value = false;

    try {
        await api.uploadMedia(newSentenceId.value, selectedFile.value, (p) => {
            uploadProgress.value = p;
        });
        uploaded.value = true;
        await confirm({
            title: '上传成功',
            message: "音频上传成功！",
            icon: '✅',
            confirmText: '我知道了',
            onlyOne: true,
        });
    } catch (e: any) {
        await confirm({
            title: '上传失败',
            message: (e.message || '未知错误'),
            icon: '❌',
            confirmText: '我知道了',
            onlyOne: true,
        });
    } finally {
        uploadingFile.value = false;
    }
}

async function handleModalFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
        input.value = '';
        return;
    }

    const file = input.files[0];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_MEDIA_TYPES.includes(file.type) || !ext || !ALLOWED_MEDIA_EXTS.includes(ext)) {
        await confirm({
            title: '警告',
            message: `仅支持 ${ALLOWED_MEDIA_EXTS.join(', ')} 格式`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        input.value = '';
        return;
    }
    if (file.size > DEFAULT_MAX_FILE_SIZE) {
        await confirm({
            title: '警告',
            message: `文件大小不能超过 ${DEFAULT_MAX_FILE_SIZE / 1024 / 1024}MB`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
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
    clearAll();
    router.push('/');
}

// ===== 工具 =====
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
</script>
