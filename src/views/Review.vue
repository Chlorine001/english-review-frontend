<template>
    <div class="max-w-xl mx-auto p-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">今日复习</h2>
        <div v-if="reviews.length === 0" class="text-gray-500 dark:text-gray-400">今天没有需要复习的句子 🎉</div>
        <div v-else-if="currentIndex < reviews.length">
            <div class="card p-6">
                <div class="flex items-start justify-between">
                    <p class="card-title flex-1">{{ currentSentence.content }}</p>
                    <button @click="speak(currentSentence.content)"
                        class="ml-2 text-2xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">🔊</button>
                </div>
                <div v-if="showAnswer" class="mt-4">
                    <p class="card-text">{{ currentSentence.translation }}</p>
                    <p class="card-meta" v-if="currentSentence.pronunciation">/{{ currentSentence.pronunciation }}/</p>
                    <p class="card-meta" v-if="currentSentence.notes">备注：{{ currentSentence.notes }}</p>
                    <div class="mt-6 flex flex-wrap gap-2">
                        <button @click="handleRating('again')" class="btn-rating btn-rating-again">Again</button>
                        <button @click="handleRating('hard')" class="btn-rating btn-rating-hard">Hard</button>
                        <button @click="handleRating('good')" class="btn-rating btn-rating-good">Good</button>
                        <button @click="handleRating('easy')" class="btn-rating btn-rating-easy">Easy</button>
                    </div>
                </div>
                <button v-else @click="showAnswer = true" class="btn-primary mt-4">显示答案</button>
            </div>
            <div class="mt-4 card-meta">进度：{{ currentIndex + 1 }} / {{ reviews.length }}</div>
        </div>
        <div v-else class="text-center py-10">
            <p class="text-green-600 dark:text-green-400 text-xl">所有复习已完成 🎉</p>
            <router-link to="/"
                class="mt-4 inline-block text-indigo-600 dark:text-indigo-400 underline">返回首页</router-link>
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