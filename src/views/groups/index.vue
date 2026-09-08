<template>
    <div class="max-w-4xl mx-auto p-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">🏠 我的小组</h2>

            <div class="flex gap-3 w-full sm:w-auto">
                <router-link to="/groups/join" class="btn-secondary flex-1 sm:flex-none text-center">
                    🔗 加入小组
                </router-link>
                <router-link to="/groups/create" class="btn-primary flex-1 sm:flex-none text-center">
                    ➕ 创建小组
                </router-link>
            </div>
        </div>

        <!-- 小组列表 -->
        <div v-if="loading" class="text-center py-10 text-gray-500">加载中...</div>

        <div v-else-if="groups.length === 0" class="text-center py-10">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-gray-500 dark:text-gray-400">还没有加入任何小组</p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
                创建一个小组合，或通过邀请码加入他人的小组
            </p>
            <div class="flex flex-col sm:flex-row gap-3 mt-4 justify-center">
                <router-link to="/groups/create" class="btn-primary inline-block">
                    ➕ 创建小组
                </router-link>
                <router-link to="/groups/join" class="btn-secondary inline-block">
                    🔗 加入小组
                </router-link>
            </div>
        </div>

        <!-- 小组卡片列表 -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="group in groups" :key="group.id" class="card p-4 hover:shadow-md transition cursor-pointer"
                @click="router.push(`/groups/${group.id}`)">
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ group.name }}</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ group.description ||
                            '暂无描述'
                            }}</p>
                    </div>
                    <span
                        class="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        {{ group.member_count }}人
                    </span>
                </div>
                <div class="flex justify-between items-center mt-3 text-xs text-gray-400">
                    <span>{{ group.role === 'owner' ? '👑 创建者' : '成员' }}</span>
                    <span>{{ formatDate(group.created_at) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';

const router = useRouter();
const groups = ref<any[]>([]);
const loading = ref(true);

function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function loadGroups() {
    try {
        groups.value = await api.getMyGroups();
    } catch (e) {
        console.error('加载小组失败', e);
    } finally {
        loading.value = false;
    }
}

onMounted(loadGroups);
</script>