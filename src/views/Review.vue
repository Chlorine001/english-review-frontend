<template>
    <div class="max-w-xl mx-auto p-4 pb-24 overflow-y-auto h-screen">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">今日复习</h2>

        <!-- 无复习内容 -->
        <div v-if="reviews.length === 0" class="text-center py-10">
            <div v-if="reviews.length === 0" class="text-center py-10">
                <div class="text-6xl mb-4">🎯</div>
                <p class="text-gray-500 dark:text-gray-400 text-lg">今天没有需要复习的句子</p>
                <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">你已经完成了今日所有任务，去添加新句子吧！</p>

                <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <router-link to="/add"
                        class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        ➕ 添加句子
                    </router-link>
                    <router-link to="/"
                        class="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm">
                        返回首页
                    </router-link>
                </div>
            </div>
        </div>

        <!-- 有复习内容 -->
        <div v-else-if="currentIndex < reviews.length">
            <div class="card p-6">
                <!-- 句子内容 + 发音按钮 -->
                <div class="flex items-start justify-between">
                    <p class="card-title flex-1">{{ currentSentence.content }}</p>
                    <button @click="speak(currentSentence.content)"
                        class="ml-2 text-2xl hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="朗读句子">
                        🔊
                    </button>
                </div>

                <!-- 音频播放器（如果有音频） -->
                <div v-if="currentSentence.audio_path" class="mt-3">
                    <audio controls :src="audioUrls[currentSentence.id]" class="w-full h-10"
                        crossorigin="use-credentials" />
                </div>
                <!-- 答案区域 -->
                <div v-if="showAnswer" class="mt-4">
                    <p class="card-text">{{ currentSentence.translation }}</p>
                    <p class="card-meta" v-if="currentSentence.pronunciation">
                        /{{ currentSentence.pronunciation }}/
                    </p>
                    <p class="card-meta" v-if="currentSentence.notes">
                        备注：{{ currentSentence.notes }}
                    </p>

                    <!-- 评分按钮 -->
                    <div class="mt-6 grid grid-cols-4 gap-2">
                        <button @click="handleRating('again')" class="btn-rating btn-rating-again">Again</button>
                        <button @click="handleRating('hard')" class="btn-rating btn-rating-hard">Hard</button>
                        <button @click="handleRating('good')" class="btn-rating btn-rating-good">Good</button>
                        <button @click="handleRating('easy')" class="btn-rating btn-rating-easy">Easy</button>
                    </div>
                </div>

                <!-- 显示答案按钮 -->
                <button v-else @click="showAnswer = true" class="btn-primary mt-4">
                    显示答案
                </button>
            </div>

            <!-- 进度 -->
            <div class="mt-4 card-meta">
                进度：{{ currentIndex + 1 }} / {{ reviews.length }}
            </div>
        </div>

        <!-- 全部完成 -->
        <!-- 全部完成 -->
        <div v-else class="text-center py-10">
            <div class="text-6xl mb-4">🎉</div>
            <p class="text-green-600 dark:text-green-400 text-2xl font-bold">所有复习已完成！</p>
            <p class="text-gray-500 dark:text-gray-400 mt-2">太棒了，今天的目标全部达成 🏆</p>
            <router-link to="/"
                class="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                返回首页
            </router-link>
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

// 当前句子
const currentSentence = computed(() => reviews.value[currentIndex.value] || {});

// 加载今日复习列表
async function loadReviews() {
    try {
        reviews.value = await api.getTodayReviews();
        // 为每个有音频的句子缓存 URL
        reviews.value.forEach((review: any) => {
            if (review.audio_path) {
                loadAudioUrl(review.id);
            }
        });
    } catch (e) {
        // 如果 token 失效或其他错误，跳回登录页
        router.push('/login');
    }
}

// 在 Review.vue 的 script 中
const audioUrls = ref<Record<number, string>>({});

// 加载音频 URL 的函数
function loadAudioUrl(sentenceId: number) {
    if (audioUrls.value[sentenceId]) return; // 已缓存则跳过
    // 直接使用 API 路径
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    audioUrls.value[sentenceId] = `${baseURL}/api/sentences/${sentenceId}/audio`;
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
    // 预加载语音
    if (window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
});

</script>