<template>
    <div>
        <!-- 分享按钮 -->
        <div v-if="props.isMember" class="mb-4">
            <button @click="openShareModal" class="btn-primary text-sm">
                ➕ 分享句子到小组
            </button>
        </div>

        <!-- 空状态 -->
        <div v-if="sentences.length === 0" class="flex items-center justify-center py-16">
            <div class="text-center text-gray-400 dark:text-gray-500">
                <p class="text-4xl mb-2">📭</p>
                <p class="text-sm">还没有分享的句子</p>
            </div>
        </div>

        <!-- 句子列表 -->
        <div v-else class="space-y-3">
            <div v-for="item in sentences" :key="item.id"
                class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                <!-- 英文句子 -->
                <p class="text-gray-900 dark:text-white font-medium break-words">
                    原文： {{ item.content }}
                </p>

                <!-- 中文翻译 -->
                <p v-if="item.translation" class="text-gray-600 dark:text-gray-300 text-sm mt-1 break-words">
                    翻译： {{ item.translation }}
                </p>

                <!-- 音标 -->
                <p v-if="item.pronunciation" class="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                    /{{ item.pronunciation }}/
                </p>

                <!-- 来源 -->
                <p v-if="item.source" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    来源： {{ item.source }}
                </p>
                <!-- ✅ 媒体播放器
                <div v-if="item.media_path" class="flex items-start justify-between">
                    <MediaPlayer :src="mediaUrls[item.id]" :file-format="item.media_format || ''" show-info
                        video-class="max-h-48" />
                </div> -->
                <!-- <div v-if="item.media_path" class="mt-3">-->

                <!-- 底部：贡献者 + 时间 + 操作 -->
                <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <span>贡献者：{{ item.user_nickname || item.user_email }}</span>
                        <span>·</span>
                        <span>{{ formatDate(item.created_at) }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button v-if="item.media_path" @click="openMediaModal(item)"
                            class="text-xs text-gray-400 hover:text-indigo-500 transition-colors flex items-center gap-1"
                            title="播放媒体">
                            {{ isVideo(item.media_format) ? '🎬' : '🎵' }}
                        </button>
                        <!-- ✅ 复制按钮（自己的不显示） -->
                        <button v-if="item.user_id !== currentUserId" @click="copySentence(item)"
                            class="text-xs text-gray-400 hover:text-green-500 transition-colors" title="复制到我的句子库">
                            📥
                        </button>
                        <!-- 点赞 -->
                        <button @click="likeSentence(item.id)"
                            class="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                            ❤️ {{ item.likes || 0 }}
                        </button>
                        <!-- 删除（仅自己的） -->
                        <button v-if="item.user_id === currentUserId" @click="deleteSentence(item.id)"
                            class="text-xs text-gray-400 hover:text-red-500 transition-colors">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分享弹窗 -->
        <div v-if="showShareModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            @click.self="showShareModal = false">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">📤 分享句子到小组</h3>

                <!-- 我的句子列表 -->
                <div v-if="loadingMySentences" class="text-center py-8 text-gray-400">加载中...</div>
                <div v-else-if="mySentences.length === 0" class="text-center py-8 text-gray-400">
                    <p class="text-4xl mb-2">📭</p>
                    <p class="text-sm">没有可以分享的句子</p>
                    <p class="text-xs text-gray-500 mt-1">你的句子可能都已经分享到小组了</p>
                </div>
                <div v-else class="flex-1 overflow-y-auto space-y-2 mb-4">
                    <div v-for="s in mySentences" :key="s.id" @click="selectedSentenceId = s.id"
                        class="p-3 rounded-lg cursor-pointer border transition-colors" :class="selectedSentenceId === s.id
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'">
                        <p class="text-sm text-gray-900 dark:text-white truncate">{{ s.content }}</p>
                        <p v-if="s.translation" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {{ s.translation }}
                        </p>
                    </div>
                </div>

                <!-- 按钮 -->
                <div class="grid grid-cols-2 gap-3">
                    <button @click="showShareModal = false"
                        class="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                        取消
                    </button>
                    <button @click="shareSentence"
                        class="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!selectedSentenceId || sharing">
                        {{ sharing ? '分享中...' : '确认分享' }}
                    </button>
                </div>
            </div>
        </div>
        <!-- ✅ 媒体播放弹窗 -->
        <div v-if="showMediaModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            @click.self="closeMediaModal">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl w-full">
                <!-- 标题 -->
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate pr-4">
                        {{ currentMedia?.content }}
                    </h3>
                    <button @click="closeMediaModal"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none flex-shrink-0"
                        title="关闭">
                        ✕
                    </button>
                </div>

                <!-- 播放器 -->
                <MediaPlayer v-if="currentMedia" :src="mediaUrls[currentMedia.sentence_id]"
                    :file-format="currentMedia.media_format || ''" show-info video-class="max-h-[60vh]" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';
import { confirm } from '@/utils/verifyCheck';
import { formatBeijingTime } from '@/utils/time';
import MediaPlayer from '@/composables/MediaPlayer.vue';

const props = defineProps<{
    sentences: any[];
    groupId: number;
    isMember: boolean;
}>();

// 在 Review.vue 的 script 中
const mediaUrls = ref<Record<number, string>>({});

// 加载音频 URL 的函数
function loadMediaUrl(sentenceId: number) {
    if (mediaUrls.value[sentenceId]) return; // 已缓存则跳过
    // 直接使用 API 路径
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    mediaUrls.value[sentenceId] = `${baseURL}/api/sentences/${sentenceId}/media`;
}
// 媒体弹窗状态
const showMediaModal = ref(false);
const currentMedia = ref<any>(null);

function openMediaModal(item: any) {
    currentMedia.value = item;
    showMediaModal.value = true;
    // 确保 URL 已加载
    loadMediaUrl(item.sentence_id);
}

function closeMediaModal() {
    showMediaModal.value = false;
    currentMedia.value = null;
}

// 判断是否为视频
function isVideo(format: string | null): boolean {
    if (!format) return false;
    return ['mp4', 'webm', 'mov'].includes(format.toLowerCase());
}

// 复制到我的句子库
async function copySentence(item: any) {
    const ok = await confirm({
        title: '复制到我的句子库',
        message: '将该句子复制到你的个人句子库，并加入复习计划？',
        icon: '📥',
        confirmText: '复制',
        cancelText: '取消',
    });
    if (!ok) return;

    try {
        await api.copyGroupSentence(props.groupId, item.id);
        await confirm({
            title: '复制成功',
            message: '已添加到你的句子库，可以在「句子库」中查看',
            icon: '✅',
            confirmText: '我知道了',
            onlyOne: true,
        });
    } catch (e: any) {
        if (e.message?.includes('已有相同句子')) {
            await confirm({
                title: '无需复制',
                message: '你的句子库中已有相同句子',
                icon: '💡',
                confirmText: '我知道了',
                onlyOne: true,
            });
        } else {
            alert('复制失败：' + (e.message || '未知错误'));
        }
    }
}

const emit = defineEmits(['refresh']);

const showShareModal = ref(false);
const selectedSentenceId = ref<number | null>(null);
const sharing = ref(false);
const loadingMySentences = ref(false);
const mySentences = ref<any[]>([]);

function formatDate(date: string): string {
    return formatBeijingTime(date);
}

// 打开分享弹窗
async function openShareModal() {
    showShareModal.value = true;
    selectedSentenceId.value = null;
    loadingMySentences.value = true;

    try {
        // 1. 获取个人句子
        const res: any = await api.getSentences();
        const allSentences = res.data || res || [];

        // 2. 获取小组已分享的句子 ID
        const sharedIds = new Set(
            props.sentences.map((s: any) => s.sentence_id)
        );

        // 3. 过滤掉已分享的
        mySentences.value = allSentences.filter(
            (s: any) => !sharedIds.has(s.id)
        );
    } catch (e) {
        console.error('加载句子失败', e);
    } finally {
        loadingMySentences.value = false;
    }
}
// 分享
async function shareSentence() {
    if (!selectedSentenceId.value) return;
    sharing.value = true;
    try {
        await api.shareSentenceToGroup(props.groupId, selectedSentenceId.value);
        showShareModal.value = false;
        emit('refresh');
    } catch (e: any) {
        alert('分享失败：' + (e.message || '未知错误'));
    } finally {
        sharing.value = false;
    }
}

// 删除
async function deleteSentence(sentenceId: number) {
    const ok = await confirm({
        title: '删除句子',
        message: '确定要从小组中删除这个句子吗？',
        icon: '🗑️',
        confirmText: '删除',
        cancelText: '取消',
    });
    if (!ok) return;

    try {
        await api.deleteGroupSentence(props.groupId, sentenceId);
        emit('refresh');
    } catch (e: any) {
        alert('删除失败：' + (e.message || '未知错误'));
    }
}

// 点赞
async function likeSentence(sentenceId: number) {
    try {
        await api.likeGroupSentence(props.groupId, sentenceId);
        emit('refresh');
    } catch (e: any) {
        console.error('点赞失败', e);
    }
}

const currentUserId = ref(0);

onMounted(async () => {
    try {
        const profile = await api.getProfile();
        currentUserId.value = profile.id;
    } catch (e) {
        console.error('获取用户信息失败', e);
    }
});
</script>