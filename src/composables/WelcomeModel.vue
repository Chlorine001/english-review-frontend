<!-- WelcomeModal.vue -->
<template>
    <Teleport to="body">
        <div v-if="visible"
            class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-28 p-8 overflow-y-auto h-screen">
            <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
                <!-- 装饰小元素（可选） -->
                <div
                    class="absolute -top-10 -right-10 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full opacity-50">
                </div>
                <div class="relative">
                    <div class="text-center">
                        <div class="text-5xl mb-3">✒️</div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">欢迎来到 LexiScribe</h2>
                        <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm leading-relaxed">
                            你的个人英语句子记忆助手。<br>
                            保存你喜欢的好句子，系统会自动安排复习，<br>
                            让它们在你快要忘记的时候再次出现。
                        </p>
                    </div>

                    <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm">
                        <div class="rgb(210 210 211) dark:bg-gray-700/50 rounded-lg p-3">
                            <div class="text-2xl">📝</div>
                            <div class="font-medium text-gray-800 dark:text-white mt-1">记录</div>
                            <div class="text-gray-500 dark:text-gray-400 text-xs">保存喜欢的句子</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div class="text-2xl">🔄</div>
                            <div class="font-medium text-gray-800 dark:text-white mt-1">复习</div>
                            <div class="text-gray-500 dark:text-gray-400 text-xs">智能间隔重复</div>
                        </div>
                        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                            <div class="text-2xl">🎯</div>
                            <div class="font-medium text-gray-800 dark:text-white mt-1">掌握</div>
                            <div class="text-gray-500 dark:text-gray-400 text-xs">形成个人语料库</div>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-center">
                        <button @click="close"
                            class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
                            开始使用 🚀
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const visible = ref(false);

function close() {
    visible.value = false;
    localStorage.setItem('lexiscribe_welcome_shown', 'true');
}

onMounted(() => {
    if (!localStorage.getItem('lexiscribe_welcome_shown')) {
        visible.value = true;
    }
});
</script>