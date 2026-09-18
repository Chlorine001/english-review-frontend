<template>
    <div class="max-w-4xl mx-auto p-4">
        <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            🎵 音频格式转换器
        </h1>

        <!-- 文件上传区 -->
        <div v-if="!file" class="card p-6">
            <div class="border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-12 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                @click="selectFile" @dragover.prevent @drop.prevent="handleDrop">
                <div class="text-5xl mb-4">🎵</div>
                <p class="text-base text-gray-700 dark:text-gray-300 font-medium">
                    上传音频文件
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    支持 MP3、WAV、M4A、AAC、FLAC、OGG、OPUS、WMA、AIFF、AMR
                </p>
                <p class="text-xs text-blue-500 dark:text-blue-400 mt-3">
                    🔒 所有转换均在浏览器本地完成，您的文件不会离开您的设备
                </p>
            </div>
            <input ref="fileInput" type="file" :accept="MEDIA_ACCEPT" class="hidden" @change="handleFileChange" />
        </div>

        <!-- 转换界面 -->
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 左侧：预览 + 剪辑 -->
            <div class="card p-4 md:col-span-2">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">音频预览</h3>
                    <button @click="resetFile"
                        class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
                        更换文件
                    </button>
                </div>

                <!-- 文件信息 -->
                <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 mb-4">
                    <p class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ file.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        大小：{{ formatFileSize(file.size) }} · 时长：{{ formatDuration(duration) }}
                    </p>
                </div>

                <!-- 播放器 -->
                <MediaPlayer v-if="mediaUrl" :src="mediaUrl" ref="mediaRef" :file-format="fileFormat"
                    :file-name="fileName" show-info @loaded="onLoadedMetadata" video-class="max-h-64" />
                <!-- ✅ 用区间滑块组件 -->
                <RangeSlider v-model="trimRange" :max="duration" :step="0.01" label="剪辑区间" class="mb-3" />

                <div class="flex gap-2">
                    <button @click="playSelection" class="btn-secondary text-sm px-4 py-2">
                        ▶️ 播放选中片段
                    </button>
                    <button @click="resetTrim" class="btn-secondary text-sm px-4 py-2">
                        🔄 重置区间
                    </button>
                </div>
            </div>

            <!-- 右侧：设置 -->
            <div class="card p-4">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">音频设置</h3>

                <!-- 输出格式 -->
                <div class="mb-4">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">输出格式</label>
                    <select v-model="outputFormat" class="input-field text-sm">
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                        <option value="ogg">OGG</option>
                        <option value="m4a">M4A</option>
                        <option value="flac">FLAC</option>
                    </select>
                </div>

                <!-- 比特率 -->
                <div v-if="outputFormat !== 'wav' && outputFormat !== 'flac'" class="mb-4">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">比特率 (kbps)</label>
                    <select v-model.number="bitrate" class="input-field text-sm">
                        <option :value="96">96 kbps</option>
                        <option :value="128">128 kbps</option>
                        <option :value="192">192 kbps</option>
                        <option :value="256">256 kbps</option>
                        <option :value="320">320 kbps</option>
                    </select>
                </div>

                <!-- 预计大小 -->
                <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    预计输出大小：约 {{ estimatedSize }}
                </div>

                <!-- 转换进度 -->
                <div v-if="converting" class="mb-4">
                    <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>{{ statusText }}</span>
                        <span>{{ progress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            :style="{ width: progress + '%' }"></div>
                    </div>
                </div>

                <!-- 转换按钮 -->
                <button @click="startConvert" :disabled="converting"
                    class="btn-primary w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ converting ? '转换中...' : '🎬 开始转换' }}
                </button>

                <!-- 下载按钮 -->
                <a v-if="downloadUrl" :href="downloadUrl" :download="outputFileName"
                    class="btn-secondary w-full py-3 text-sm text-center block mt-3">
                    ⬇️ 下载 {{ outputFormat.toUpperCase() }}
                </a>

                <!-- 错误提示 -->
                <p v-if="errorMessage" class="mt-3 text-xs text-red-600 dark:text-red-400 text-center">
                    {{ errorMessage }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ALLOWED_MEDIA_TYPES, ALLOWED_MEDIA_EXTS, DEFAULT_CHANGE_MAX_FILE_SIZE, MEDIA_ACCEPT } from '@/constants';
import { confirm } from '@/utils/verifyCheck';
import RangeSlider from '@/components/RangeSlider.vue';
import MediaPlayer from '@/components/MediaPlayer.vue';
import { toBeijingISOString } from '../utils/time';

// ===== 状态 =====
const fileInput = ref<HTMLInputElement | null>(null);
const mediaRef = ref<InstanceType<typeof MediaPlayer> | null>(null);

const file = ref<File | null>(null);
const mediaUrl = ref('');
const duration = ref(0);

const outputFormat = ref('mp3');
const bitrate = ref(192);

const ffmpeg = ref<FFmpeg | null>(null);
const loaded = ref(false);
const converting = ref(false);
const progress = ref(0);
const statusText = ref('');
const downloadUrl = ref('');
const outputFileName = ref('');
const errorMessage = ref('');

// ===== 文件选择 =====
function selectFile() {
    fileInput.value?.click();
}
// 从文件名推断格式（用于 MediaPlayer 显示图标/类型）
const fileFormat = computed(() => {
    if (!file.value) return '';
    return file.value.name.split('.').pop()?.toLowerCase() || '';
});

// 文件名
const fileName = computed(() => file.value?.name || '');

async function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const selectedFile = input.files[0];
    // 1️⃣ 校验扩展名
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_MEDIA_EXTS.includes(ext)) {
        await confirm({
            title: '警告',
            message: `仅支持 ${ALLOWED_MEDIA_EXTS.join(', ')} 格式`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return;
    }

    // 2️⃣ 校验 MIME 类型（浏览器识别的类型）
    if (!ALLOWED_MEDIA_TYPES.includes(selectedFile.type) && selectedFile.type !== '') {
        await confirm({
            title: '警告',
            message: `不支持的文件类型：${selectedFile.type}`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return;
    }

    // 3️⃣ 校验文件大小
    if (selectedFile.size > DEFAULT_CHANGE_MAX_FILE_SIZE) {
        await confirm({
            title: '警告',
            message: `文件大小不能超过 ${DEFAULT_CHANGE_MAX_FILE_SIZE / 1024 / 1024}MB`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return;
    }

    // ✅ 通过校验，加载文件
    loadFile(selectedFile);
    input.value = ''; // 允许重复选择同一文件
}

async function handleDrop(e: DragEvent) {
    const droppedFile = e.dataTransfer?.files[0];
    if (!droppedFile) return;
    // 1️⃣ 校验扩展名
    const ext = droppedFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_MEDIA_EXTS.includes(ext)) {
        await confirm({
            title: '警告',
            message: `仅支持 ${ALLOWED_MEDIA_EXTS.join(', ')} 格式`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return;
    }

    // 2️⃣ 校验大小
    if (droppedFile.size > DEFAULT_CHANGE_MAX_FILE_SIZE) {
        await confirm({
            title: '警告',
            message: `文件大小不能超过 ${DEFAULT_CHANGE_MAX_FILE_SIZE / 1024 / 1024}MB`,
            icon: '⚠️',
            confirmText: '我知道了',
            onlyOne: true,
        });
        return;
    }
    loadFile(droppedFile);
}

function resetFile() {
    if (mediaUrl.value) URL.revokeObjectURL(mediaUrl.value);
    if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);
    file.value = null;
    mediaUrl.value = '';
    downloadUrl.value = '';
    duration.value = 0;
    progress.value = 0;
    statusText.value = '';
    errorMessage.value = '';
    outputFileName.value = '';
}

function loadFile(f: File) {
    resetFile();
    file.value = f;
    mediaUrl.value = URL.createObjectURL(f);
}

const trimRange = ref<[number, number]>([0, 0]);
// 计算属性：起止时间
const trimStart = computed(() => trimRange.value[0]);
const trimEnd = computed(() => trimRange.value[1]);

// ===== 音频元数据 =====
function onLoadedMetadata({ duration: d }: { duration: number }) {
    duration.value = d;
    trimRange.value = [0, d];  // ✅ 初始化为完整区间
}

// ===== 剪辑 =====
function playSelection() {
    const player = mediaRef.value;
    if (!player) return;
    const [start, end] = trimRange.value;
    player.seek(start);
    player.play();
    const checkEnd = () => {
        if (player.getCurrentTime() >= end) {
            player.pause();
            player.offTimeUpdate(checkEnd);
        }
    };
    player.onTimeUpdate(checkEnd);
}

// 重置
function resetTrim() {
    trimRange.value = [0, duration.value];
}

// ===== 预计大小 =====
const estimatedSize = computed(() => {
    if (outputFormat.value === 'wav') {
        // WAV 未压缩：采样率 * 位深 * 声道 * 时长 / 8
        const seconds = trimEnd.value - trimStart.value;
        const size = 44100 * 16 * 2 * seconds / 8;
        return formatFileSize(size);
    }
    if (outputFormat.value === 'flac') {
        const seconds = trimEnd.value - trimStart.value;
        const size = 44100 * 16 * 2 * seconds / 8 * 0.6; // FLAC 约压缩到 60%
        return formatFileSize(size);
    }
    // 其他有损格式：比特率 * 时长 / 8
    const seconds = trimEnd.value - trimStart.value;
    const size = bitrate.value * 1000 * seconds / 8;
    return formatFileSize(size);
});

// ===== 加载 FFmpeg =====
async function loadFFmpeg() {
    if (loaded.value) return;

    statusText.value = '正在加载 FFmpeg 核心...';
    progress.value = 0;

    try {
        const instance = new FFmpeg();
        instance.on('progress', ({ progress: p }) => {
            progress.value = Math.min(100, Math.round(p * 100));
        });
        instance.on('log', ({ message }) => {
            console.log('[FFmpeg]', message);
        });

        await instance.load({
            coreURL: await toBlobURL('/ffmpeg-core/ffmpeg-core.js', 'text/javascript'),
            wasmURL: await toBlobURL('/ffmpeg-core/ffmpeg-core.wasm', 'application/wasm'),
        });

        ffmpeg.value = instance;
        loaded.value = true;
    } catch (e: any) {
        console.error('FFmpeg 加载失败:', e);
        throw new Error('FFmpeg 加载失败，请刷新页面重试');
    }
}

// ===== 转换 =====
async function startConvert() {
    if (!file.value) return;

    converting.value = true;
    progress.value = 0;
    errorMessage.value = '';
    downloadUrl.value = '';

    try {
        await loadFFmpeg();

        statusText.value = '正在读取文件...';
        const ff = ffmpeg.value!;

        // 写入输入文件
        const inputName = 'input.' + (file.value.name.split('.').pop() || 'mp3');
        await ff.writeFile(inputName, await fetchFile(file.value));

        // 构建命令
        statusText.value = '正在转换...';
        const outputName = `output.${outputFormat.value}`;
        const args = ['-i', inputName];

        // 剪辑
        if (trimStart.value > 0) args.push('-ss', String(trimStart.value));
        const clipDuration = trimEnd.value - trimStart.value;
        if (clipDuration > 0 && clipDuration < duration.value) {
            args.push('-t', String(clipDuration));
        }

        // 比特率
        if (outputFormat.value !== 'wav' && outputFormat.value !== 'flac') {
            args.push('-b:a', `${bitrate.value}k`);
        }

        args.push(outputName);

        await ff.exec(args);

        // 读取结果
        statusText.value = '正在生成文件...';

        const data = await ff.readFile(outputName);
        if (typeof data === 'string') {
            throw new Error('Unexpected string output');
        }
        // ✅ slice 会创建新的 Uint8Array，其 buffer 类型是 ArrayBuffer
        const uint8Array = data.slice();
        const mimeType = getMimeType(outputFormat.value);
        const blob = new Blob([uint8Array], { type: mimeType });
        downloadUrl.value = URL.createObjectURL(blob);

        // 生成输出文件名
        const baseName = file.value.name.replace(/\.[^.]+$/, '');
        const timestamp = toBeijingISOString();
        outputFileName.value = `${baseName}_${timestamp}.${outputFormat.value}`;

        progress.value = 100;
        statusText.value = '转换完成 ✅';
    } catch (e: any) {
        console.error('转换失败:', e);
        errorMessage.value = e.message || '转换失败，请重试';
    } finally {
        converting.value = false;
    }
}

// ===== 工具函数 =====
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

function getMimeType(format: string): string {
    const map: Record<string, string> = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        m4a: 'audio/mp4',
        flac: 'audio/flac',
    };
    return map[format] || 'audio/mpeg';
}

onBeforeUnmount(() => {
    if (mediaUrl.value) URL.revokeObjectURL(mediaUrl.value);
    if (downloadUrl.value) URL.revokeObjectURL(downloadUrl.value);
});
</script>