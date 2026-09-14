<template>
    <div class="max-w-4xl mx-auto p-4">
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-10 text-gray-500">加载中...</div>

        <!-- 小组不存在 -->
        <div v-else-if="!group" class="text-center py-16">
            <div class="text-6xl mb-4">🔍</div>
            <p class="text-gray-500 dark:text-gray-400">小组不存在或已被删除</p>
            <router-link to="/mygroups" class="mt-4 inline-block btn-primary">
                🏠 返回小组列表
            </router-link>
        </div>

        <!-- 小组详情 -->
        <div v-else>
            <!-- 小组头部 -->
            <div class="card p-6 mb-4">
                <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white break-words">
                            {{ group.name }}
                        </h2>
                        <p class="text-gray-600 dark:text-gray-300 mt-1 break-words">
                            {{ group.description || '暂无描述' }}
                        </p>
                        <div class="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                            <!-- 创建者 -->
                            <span class="inline-flex items-center gap-1">
                                <span>👑</span>
                                <span class="font-medium text-gray-700 dark:text-gray-300">
                                    {{ group.owner_name || '创建者' }}
                                </span>
                            </span>

                            <!-- 分隔点 -->
                            <span class="text-gray-300 dark:text-gray-600">·</span>

                            <!-- 成员数 -->
                            <span class="inline-flex items-center gap-1">
                                <span>👥</span>
                                <span>{{ group.member_count }} 人</span>
                            </span>

                            <!-- 分隔点 -->
                            <span class="text-gray-300 dark:text-gray-600">·</span>

                            <!-- ✅ 公开/私密：加上图标，垂直对齐 -->
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full  font-medium" :class="group.is_public
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'">
                                <span>{{ group.is_public ? '🌍' : '🔒' }}</span>
                                <span>{{ group.is_public ? '公开' : '私密' }}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 标签页 -->
            <div class="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                    class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
                    :class="activeTab === tab.key
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'">
                    {{ tab.label }} <span v-if="tab.count !== undefined" class="text-xs">({{ tab.count }})</span>
                </button>
            </div>

            <!-- 内容 -->
            <div class="card p-4">
                <!-- 成员列表 -->
                <GroupMember v-if="activeTab === 'members'" :members="group.members || []" :is-owner="group.isOwner"
                    :group-id="group.id" @refresh="loadGroupDetail" />

                <!-- 小组句子 -->
                <GroupSentence v-else-if="activeTab === 'sentences'" :sentences="sentences" :group-id="group.id"
                    @refresh="loadSentences" />

                <!-- 动态 -->
                <GroupActivity v-else-if="activeTab === 'activities'" :activities="activities" />

                <!-- 管理 -->
                <GroupSetting v-else-if="activeTab === 'setting'" :group="group" :is-owner="group.isOwner"
                    @refresh="loadGroupDetail" />
            </div>

            <!-- 加入小组按钮（非成员且非创建者） -->
            <div v-if="!group.isMember && !group.isOwner && !group.isAdmin" class="mt-4">
                <button @click="handleJoinGroup" class="btn-primary w-full">
                    加入小组
                </button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/api';
import GroupMember from './components/GroupMember.vue';
import GroupSentence from './components/GroupSentence.vue';
import GroupActivity from './components/GroupActivity.vue';
import GroupSetting from './components/GroupSetting.vue';
import { confirm } from '@/utils/verifyCheck';

const route = useRoute();
const groupId = Number(route.params.id);

const loading = ref(true);
const group = ref<any>(null);
const sentences = ref<any[]>([]);
const activities = ref<any[]>([]);
const activeTab = ref('members');
const joining = ref(false);

const tabs = computed(() => [
    { key: 'members', label: '👤成员', count: group.value?.member_count || 0 },
    { key: 'sentences', label: '句子', count: sentences.value.length },
    { key: 'activities', label: '动态', count: activities.value.length },
    { key: 'setting', label: '管理'},
]);

async function loadGroupDetail() {
    try {
        const data = await api.getGroupDetail(groupId);
        group.value = data;
    } catch (e) {
        console.error('加载小组详情失败：', e);
    } finally {
        loading.value = false;
    }
}

async function loadSentences() {
    try {
        // TODO: 实现获取小组句子的 API
        // sentences.value = await api.getGroupSentences(groupId);
    } catch (e) {
        console.error('加载句子失败', e);
    }
}

async function loadActivities() {
    try {
        activities.value = await api.getGroupActivities(groupId);
    } catch (e) {
        console.error('加载动态失败', e);
    }
}

async function handleJoinGroup() {
    joining.value = true;
    try {
        if (group.value?.is_public) {
            await api.joinGroupDirectly(groupId);
        }
        // 重新加载小组详情
        await loadGroupDetail();
        await confirm({
            title: '加入成功！',
            message: '欢迎加入小组！',
            icon: '🎉',
            confirmText: '我知道了',
            onlyOne: true,
        });
    } catch (e: any) {
        await confirm({
            title: '加入失败！',
            message: e.message || '未知错误',
            icon: '❌',
            confirmText: '我知道了',
            onlyOne: true,
        });
    } finally {
        joining.value = false;
    }
}

onMounted(() => {
    loadGroupDetail();
    loadSentences();
    loadActivities();
});
</script>