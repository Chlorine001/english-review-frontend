<template>
    <div class="max-w-2xl mx-auto p-4">
        <button @click="router.back"
            class="text-sm text-gray-500 dark:text-gray-400 mb-4 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            ← 返回
        </button>
        <slot />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>