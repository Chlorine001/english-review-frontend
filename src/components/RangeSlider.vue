<template>
    <div class="w-full">
        <!-- 标签 + 时间显示 -->
        <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>{{ label }}</span>
            <span>{{ formatTime(start) }} → {{ formatTime(end) }}</span>
        </div>

        <!-- 轨道 -->
        <div class="relative h-6 flex items-center">
            <!-- 背景轨道 -->
            <div class="absolute w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>

            <!-- 选中区间高亮 -->
            <div class="absolute h-1 bg-indigo-500 rounded"
                :style="{ left: startPercent + '%', width: widthPercent + '%' }"></div>

            <!-- 起点滑块 -->
            <input :value="start" @input="onStartInput" type="range" :min="min" :max="max" :step="step"
                class="range-slider absolute w-full" style="z-index: 3;" />

            <!-- 终点滑块 -->
            <input :value="end" @input="onEndInput" type="range" :min="min" :max="max" :step="step"
                class="range-slider absolute w-full" style="z-index: 2;" />
        </div>

        <!-- 刻度 -->
        <div class="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>{{ formatTime(min) }}</span>
            <span>{{ formatTime(max) }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// ===== Props =====
const props = withDefaults(
    defineProps<{
        modelValue: [number, number];
        min?: number;
        max: number;
        step?: number;
        label?: string;
    }>(),
    {
        min: 0,
        step: 0.1,
        label: '剪辑区间',
    }
);

// ===== Emits =====
const emit = defineEmits<{
    'update:modelValue': [value: [number, number]];
}>();

// ===== 内部状态 =====
const range = ref<[number, number]>(props.modelValue || [props.min, props.max]);

// ===== 起点（computed 带 setter） =====
const start = computed({
    get: () => range.value[0],
    set: (val: number) => {
        const newStart = Math.max(props.min, Math.min(val, range.value[1]));
        range.value = [newStart, range.value[1]];
    },
});

// ===== 终点（computed 带 setter） =====
const end = computed({
    get: () => range.value[1],
    set: (val: number) => {
        const newEnd = Math.min(props.max, Math.max(val, range.value[0]));
        range.value = [range.value[0], newEnd];
    },
});

// ===== 起点百分比 =====
const startPercent = computed(() => {
    const span = props.max - props.min;
    if (span <= 0) return 0;
    return ((start.value - props.min) / span) * 100;
});

// ===== 终点百分比 =====
const endPercent = computed(() => {
    const span = props.max - props.min;
    if (span <= 0) return 0;
    return ((end.value - props.min) / span) * 100;
});

// ===== 选中区间宽度百分比 =====
const widthPercent = computed(() => endPercent.value - startPercent.value);

// ===== 输入事件 =====
function onStartInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    start.value = val;
}

function onEndInput(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    end.value = val;
}

// ===== 内部变化 → 同步给父组件 =====
watch(
    range,
    (val) => {
        emit('update:modelValue', val);
    },
    { deep: true }
);

// ===== 父组件变化 → 同步到内部 =====
watch(
    () => props.modelValue,
    (val) => {
        if (val[0] !== start.value || val[1] !== end.value) {
            range.value = [val[0], val[1]];
        }
    },
    { deep: true }
);

// ===== 时间格式化 =====
function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}
</script>

<style scoped>
.range-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    pointer-events: none;
    height: 24px;
}

.range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    pointer-events: auto;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6366f1;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: transform 0.15s;
}

.range-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
}

.range-slider::-moz-range-thumb {
    pointer-events: auto;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6366f1;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    border: none;
}

.range-slider::-moz-range-track {
    background: transparent;
}
</style>