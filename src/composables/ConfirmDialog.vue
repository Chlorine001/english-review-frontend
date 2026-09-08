<template>
    <Teleport to="body">
        <div v-if="visible" class="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
            style="background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);" @click.self="handleCancel">
            <!-- ✅ 弹窗容器：固定宽度 + 自动居中 -->
            <div
                class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm mx-auto p-6 shadow-2xl transform transition-all duration-200 scale-100">
                <!-- 图标 -->
                <div class="text-center mb-4">
                    <div class="text-5xl">{{ icon }}</div>
                </div>

                <!-- 标题 -->
                <h3 class="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    {{ title }}
                </h3>

                <!-- 内容 -->
                <p class="text-center text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {{ message }}
                </p>

                <!-- 按钮 -->
                <div class="flex gap-3 mt-6">
                    <button @click="handleCancel"
                        class="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                        {{ cancelText }}
                    </button>
                    <button @click="handleConfirm"
                        class="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium">
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Props
const props = withDefaults(
    defineProps<{
        title?: string;
        message?: string;
        icon?: string;
        confirmText?: string;
        cancelText?: string;
    }>(),
    {
        title: '提示',
        message: '确定执行此操作吗？',
        icon: '⚠️',
        confirmText: '确定',
        cancelText: '取消',
    }
);

// Emit
const emit = defineEmits<{
    confirm: [];
    cancel: [];
}>();

// 状态
const visible = ref(false);
let resolvePromise: ((value: boolean) => void) | null = null;

// 显示弹窗（返回 Promise）
function show(): Promise<boolean> {
    visible.value = true;
    return new Promise((resolve) => {
        resolvePromise = resolve;
    });
}

// 确认
function handleConfirm() {
    visible.value = false;
    resolvePromise?.(true);
    resolvePromise = null;
    emit('confirm');
}

// 取消
function handleCancel() {
    visible.value = false;
    resolvePromise?.(false);
    resolvePromise = null;
    emit('cancel');
}

// 键盘事件：ESC 取消
function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && visible.value) {
        handleCancel();
    }
}

onMounted(() => {
    document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown);
});

// 暴露方法
defineExpose({ show });
</script>

<style scoped>
/* 确保页面滚动条可见 */
.h-screen {
    height: 100vh;
}

.overflow-y-auto {
    overflow-y: auto;
    scrollbar-gutter: stable;
    /* ✅ 修复滚动条边距跳动 */
}
</style>