<!-- src/components/MediaPlayer.vue -->
<template>
    <div class="media-player">
        <!-- 根据媒体类型渲染不同标签 -->
        <template v-if="isVideo">
            <video ref="mediaRef" controls :src="src" class="w-full rounded" :class="videoClass"
                @loadedmetadata="handleLoaded" />
        </template>
        <template v-else>
            <audio ref="mediaRef" controls :src="src" class="w-full" :class="audioClass"
                @loadedmetadata="handleLoaded" />
        </template>
        <!-- 可选：显示文件名或时长 -->
        <div v-if="showInfo && fileName" class="text-xs text-gray-400 mt-1 truncate">
            {{ fileName }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// ---------- Props 定义 ----------
const props = defineProps({
    // 媒体文件 URL
    src: {
        type: String,
        required: true,
    },
    // 文件格式（扩展名，如 'mp3', 'mp4'）
    fileFormat: {
        type: String,
        default: '',
    },
    // 原始文件名（可选，用于展示）
    fileName: {
        type: String,
        default: '',
    },
    // 是否显示文件名
    showInfo: {
        type: Boolean,
        default: false,
    },
    // 自定义样式类
    videoClass: {
        type: String,
        default: 'max-h-64',
    },
    audioClass: {
        type: String,
        default: 'h-10',
    },
});

// ---------- 判断媒体类型 ----------
const isVideo = computed(() => {
    if (!props.fileFormat) {
        // 如果未传格式，从 src 或 fileName 推测
        const ext = (props.src || props.fileName || '').split('.').pop()?.toLowerCase() || '';
        return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
    }
    return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(props.fileFormat.toLowerCase());
});

// ---------- 媒体元素引用 ----------
const mediaRef = ref<HTMLAudioElement | HTMLVideoElement | null>(null);

// 加载完成时触发（可用于记录时长等）
const emit = defineEmits(['loaded']);
function handleLoaded(event: Event) {
    const target = event.target as HTMLAudioElement | HTMLVideoElement;
    emit('loaded', {
        duration: target.duration,
        currentSrc: target.currentSrc,
    });
}

// ---------- 暴露方法给父组件（可选） ----------
defineExpose({
    mediaRef,
    play: () => mediaRef.value?.play(),
    pause: () => mediaRef.value?.pause(),
});
</script>

<style scoped>
.media-player {
    width: 100%;
}
</style>