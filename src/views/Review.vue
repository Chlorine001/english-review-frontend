<template>
    <div class="max-w-xl mx-auto p-4">
        <h2 class="text-2xl font-bold mb-4">今日复习</h2>
        <div v-if="reviews.length === 0" class="text-gray-500">今天没有需要复习的句子 🎉</div>
        <div v-else-if="currentIndex < reviews.length">
            <div class="border rounded-lg p-6 shadow-sm bg-white">
                <div class="flex items-start justify-between">
                    <p class="text-lg font-medium flex-1">{{ currentSentence.content }}</p>
                    <button @click="speak(currentSentence.content)"
                        class="ml-2 text-2xl hover:text-indigo-600 transition-colors" title="朗读句子">
                        🔊
                    </button>
                </div>

                <div v-if="showAnswer" class="mt-4">
                    <p class="text-gray-700">{{ currentSentence.translation }}</p>
                    <p class="text-sm text-gray-500" v-if="currentSentence.pronunciation">
                        /{{ currentSentence.pronunciation }}/
                    </p>
                    <p class="text-sm text-gray-500" v-if="currentSentence.notes">备注：{{ currentSentence.notes }}</p>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <button @click="handleRating('again')"
                            class="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200">
                            Again
                        </button>
                        <button @click="handleRating('hard')"
                            class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">
                            Hard
                        </button>
                        <button @click="handleRating('good')"
                            class="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200">
                            Good
                        </button>
                        <button @click="handleRating('easy')"
                            class="px-4 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">
                            Easy
                        </button>
                    </div>
                </div>
                <button v-else @click="showAnswer = true"
                    class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    显示答案
                </button>
            </div>
            <div class="mt-4 text-sm text-gray-400">进度：{{ currentIndex + 1 }} / {{ reviews.length }}</div>
        </div>
        <div v-else class="text-center py-10">
            <p class="text-green-600 text-xl">所有复习已完成 🎉</p>
            <router-link to="/" class="mt-4 inline-block text-indigo-600 underline">返回首页</router-link>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import { useTTS } from '@/composables/useTTS';

// 路由
const router = useRouter();

// TTS 发音
const { speak } = useTTS();

// 复习数据
const reviews = ref<any[]>([]);
const currentIndex = ref(0);
const showAnswer = ref(false);

// 当前句子（计算属性）
const currentSentence = computed(() => reviews.value[currentIndex.value] || {});

// 加载今日复习列表
async function loadReviews() {
    try {
        reviews.value = await api.getTodayReviews();
    } catch (e) {
        // 如果 token 失效或其他错误，跳回登录页
        router.push('/login');
    }
}


// 提交评分
async function handleRating(rating: string) {
    const review = reviews.value[currentIndex.value];
    if (!review) return;

    try {
        await api.submitAnswer(review.review_id, rating);
        // 移动到下一个
        currentIndex.value++;
        showAnswer.value = false;
    } catch (e) {
        alert('提交评分失败，请重试');
    }
}

onMounted(() => {
    loadReviews();
    // 预加载语音（可选）
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
});

</script>