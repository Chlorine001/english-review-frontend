<template>
    <div class="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-[#1a1b2e]">
        <div class="w-full max-w-md p-8 card text-center">
            <div class="text-7xl mb-4">🔍</div>
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-2">页面未找到</h2>
            <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                您访问的页面不存在或已被移动。
            </p>
            <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <router-link to="/" class="btn-primary">返回首页</router-link>
                <button @click="goBack" class="btn-secondary">返回上一页</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const goBack = () => {
    window.history.back();
};
</script>