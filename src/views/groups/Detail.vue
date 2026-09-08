<template>
    <div class="max-w-4xl mx-auto p-4">
        <div v-if="loading" class="text-center py-10 text-gray-500">加载中...</div>

        <div v-else-if="group">
            <!-- 小组头部 -->
            <div class="card p-6 mb-4">
                <div class="flex items-start justify-between">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ group.name }}</h2>
                        <p class="text-gray-600 dark:text-gray-300 mt-1">{{ group.description || '暂无描述' }}</p>
                        <div class="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>👑 {{ group.owner_name || '创建者' }}</span>
                            <span>👥 {{ group.member_count }} 人</span>
                            <span class="px-2 py-0.5 rounded-full text-xs"
                                :class="group.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                                {{ group.is_public ? '公开' : '私密' }}
                            </span>
                        </div>
                    </div>
                    <div class="text-right">
                        <button v-if="group.isOwner" @click="showInviteModal = true"
                            class="btn-primary text-sm px-4 py-2">
                            📨 邀请
                        </button>
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
                <GroupMember v-if="activeTab === 'members'" :members="group.members" :is-owner="group.isOwner"
                    :group-id="group.id" @refresh="loadGroupDetail" />

                <!-- 小组句子 -->
                <GroupSentence v-else-if="activeTab === 'sentences'" :sentences="sentences" :group-id="group.id"
                    @refresh="loadSentences" />

                <!-- 动态 -->
                <GroupActivity v-else-if="activeTab === 'activities'" :activities="activities" />
            </div>


            <!-- 邀请弹窗 -->
            <div v-if="showInviteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">📨 邀请链接</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        分享此链接给好友，他们可通过邀请码加入小组
                    </p>
                    <div class="flex gap-2">
                        <input :value="inviteLink" readonly class="input-field flex-1 text-sm font-mono" />
                        <button @click="copyInviteLink" class="btn-primary whitespace-nowrap">复制</button>
                    </div>
                    <p v-if="copyMessage" class="mt-2 text-sm text-green-600">{{ copyMessage }}</p>
                    <button @click="showInviteModal = false" class="btn-secondary w-full mt-4">关闭</button>
                </div>
            </div>

            <!-- 加入小组按钮（非成员） -->
            <div v-if="!group.isMember && !group.isOwner" class="mt-4">
                <button @click="joinGroup" class="btn-primary w-full">加入小组</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/api';
import GroupMember from './components/GroupMember.vue';
import GroupSentence from './components/GroupSentence.vue';
import GroupActivity from './components/GroupActivity.vue';

const route = useRoute();
const router = useRouter();
const groupId = Number(route.params.id);

const loading = ref(true);
const group = ref<any>(null);
const sentences = ref<any[]>([]);
const activities = ref<any[]>([]);
const activeTab = ref('members');
const showInviteModal = ref(false);
const copyMessage = ref('');

const tabs = computed(() => [
    { key: 'members', label: '成员', count: group.value?.member_count },
    { key: 'sentences', label: '句子', count: sentences.value.length },
    { key: 'activities', label: '动态', count: activities.value.length },
]);

const inviteLink = computed(() => {
    if (!group.value?.invite_code) return '';
    return `${window.location.origin}/groups/join?code=${group.value.invite_code}`;
});

async function loadGroupDetail() {
    try {
        const data = await api.getGroupDetail(groupId);
        group.value = data;
    } catch (e) {
        router.push('/groups');
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
        // TODO: 实现获取小组动态的 API
        // activities.value = await api.getGroupActivities(groupId);
    } catch (e) {
        console.error('加载动态失败', e);
    }
}

function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink.value);
    copyMessage.value = '✅ 已复制邀请链接';
    setTimeout(() => { copyMessage.value = ''; }, 2000);
}

async function joinGroup() {
    // TODO: 实现加入小组逻辑
    // 如果小组是公开的，直接加入
    // 如果是私密的，需要邀请码
}

onMounted(() => {
    loadGroupDetail();
    loadSentences();
    loadActivities();
});
</script>