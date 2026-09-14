<template>
    <div class="space-y-6 text-left">
        <!-- ✅ 邀请成员 -->
        <div class="space-y-3">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">邀请成员</h4>
            <p class="text-xs text-gray-400 dark:text-gray-500">
                分享此链接给好友，他们可通过邀请码加入小组
            </p>
            <div class="flex gap-2">
                <input :value="inviteLink" readonly class="input-field flex-1 text-sm font-mono" />
                <button @click="copyInviteLink" class="btn-primary whitespace-nowrap">
                    复制
                </button>
            </div>
            <p v-if="copyMessage" class="text-sm text-green-600 dark:text-green-400">
                {{ copyMessage }}
            </p>
        </div>

        <!-- ✅ 小组信息 -->
        <div v-if="isOwner" class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">小组信息</h4>

            <!-- 名称 -->
            <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                    <span class="text-sm text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">名称</span>
                    <div v-if="!editingName" class="flex-1 min-w-0">
                        <span class="text-gray-900 dark:text-white truncate block">{{ group.name }}</span>
                    </div>
                    <input v-else v-model="editName" class="input-field py-1 px-2 text-sm flex-1" maxlength="20"
                        @keydown.enter="saveName" @keydown.esc="cancelEditName" autofocus />
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button v-if="!editingName" @click="startEditName"
                        class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                        修改
                    </button>
                    <template v-else>
                        <button @click="saveName"
                            class="text-sm text-green-600 hover:text-green-800 dark:text-green-400"
                            :disabled="savingName">
                            {{ savingName ? '保存中...' : '保存' }}
                        </button>
                        <button @click="cancelEditName" class="text-sm text-gray-400 hover:text-gray-600">
                            取消
                        </button>
                    </template>
                </div>
            </div>

            <!-- 描述 -->
            <div class="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-start gap-4 flex-1 min-w-0">
                    <span class="text-sm text-gray-500 dark:text-gray-400 w-16 flex-shrink-0 mt-1">描述</span>
                    <div v-if="!editingDesc" class="flex-1 min-w-0">
                        <span class="text-gray-900 dark:text-white text-sm line-clamp-2 break-words">
                            {{ group.description || '暂无描述' }}
                        </span>
                    </div>
                    <textarea v-else v-model="editDesc" rows="2" class="input-field py-1 px-2 text-sm flex-1"
                        maxlength="200" />
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 ml-2">
                    <button v-if="!editingDesc" @click="startEditDesc"
                        class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                        修改
                    </button>
                    <template v-else>
                        <button @click="saveDesc"
                            class="text-sm text-green-600 hover:text-green-800 dark:text-green-400"
                            :disabled="savingDesc">
                            {{ savingDesc ? '保存中...' : '保存' }}
                        </button>
                        <button @click="cancelEditDesc" class="text-sm text-gray-400 hover:text-gray-600">
                            取消
                        </button>
                    </template>
                </div>
            </div>

            <!-- 可见性 -->
            <div class="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">可见性</span>
                    <span class="text-gray-900 dark:text-white text-sm">
                        {{ group.is_public ? '🌍 公开' : '🔒 私密' }}
                    </span>
                </div>
                <button @click="toggleVisibility"
                    class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    :disabled="savingVisibility">
                    {{ savingVisibility ? '切换中...' : (group.is_public ? '设为私密' : '设为公开') }}
                </button>
            </div>
        </div>

        <!-- ✅ 成员管理：组长和管理员可见 -->
        <div v-if="isOwner || group.isAdmin" class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">成员管理</h4>
            <div class="flex flex-col gap-2">
                <!-- 移除成员：管理员 + 组长 -->
                <button @click="showRemoveModal = true"
                    class="text-left text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                    🚫 移除成员
                </button>

                <!-- 转让小组：仅组长 -->
                <button v-if="isOwner" @click="openTransferModal"
                    class="text-left text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300">
                    👑 转让小组
                </button>
            </div>
        </div>

        <!-- ✅ 危险操作：仅组长可见 -->
        <div v-if="isOwner" class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-medium text-red-600 dark:text-red-400">危险操作</h4>
            <div class="flex flex-col gap-2">
                <button @click="handleDissolve"
                    class="text-left text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">
                    🗑️ 解散小组
                </button>
                <p class="text-xs text-gray-400 dark:text-gray-500">
                    解散后所有成员、句子和动态将被永久删除，此操作不可恢复。
                </p>
            </div>
        </div>
        
        <!-- ✅ 转让小组弹窗 -->
        <div v-if="showTransferModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            @click.self="showTransferModal = false">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">👑 转让小组</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    选择一位成员作为新的组长，转让后你将成为管理员。
                </p>

                <!-- 成员列表 -->
                <div class="space-y-2 max-h-64 overflow-y-auto mb-4">
                    <div v-for="member in transferableMembers" :key="member.id" @click="selectedUserId = member.id"
                        class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors" :class="selectedUserId === member.id
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300 dark:border-indigo-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'">
                        <!-- 头像 -->
                        <div
                            class="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {{ (member.nickname || member.email)?.charAt(0).toUpperCase() }}
                        </div>
                        <!-- 名字 + 邮箱 -->
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {{ member.nickname || member.email }}
                            </p>
                            <p v-if="member.nickname" class="text-xs text-gray-400 truncate">
                                {{ member.email }}
                            </p>
                        </div>
                        <!-- 选中标记 -->
                        <span v-if="selectedUserId === member.id"
                            class="text-indigo-600 dark:text-indigo-400 text-lg">✓</span>
                    </div>
                </div>

                <p v-if="transferableMembers.length === 0" class="text-center text-sm text-gray-400 py-4">
                    没有可以转让的成员
                </p>

                <!-- 按钮 -->
                <div class="grid grid-cols-2 gap-3">
                    <button @click="showTransferModal = false"
                        class="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                        取消
                    </button>
                    <button @click="handleTransfer"
                        class="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!selectedUserId || transferring">
                        {{ transferring ? '转让中...' : '确认转让' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import { confirm } from '@/utils/verifyCheck';
const props = defineProps<{
    group: any;
    isOwner: boolean;
}>();

const copyMessage = ref('');
function copyInviteLink() {
    navigator.clipboard.writeText(inviteLink.value);
    copyMessage.value = '✅ 已复制邀请链接';
    setTimeout(() => { copyMessage.value = ''; }, 2000);
}

// 邀请链接
const inviteLink = computed(() => {
    if (!props.group.invite_code) return '';
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    return `${baseUrl}/groups/join?code=${encodeURIComponent(props.group.invite_code)}`;
});

// 模态框状态
const showRemoveModal = ref(false);
const showTransferModal = ref(false);

const emit = defineEmits(['refresh']);
const router = useRouter();


// 名称编辑
const editingName = ref(false);
const editName = ref('');
const savingName = ref(false);

function startEditName() {
    editName.value = props.group.name;
    editingName.value = true;
}

function cancelEditName() {
    editingName.value = false;
    editName.value = '';
}

async function saveName() {
    const trimmed = editName.value.trim();
    if (!trimmed || trimmed.length < 2) {
        alert('小组名称至少2个字符');
        return;
    }
    savingName.value = true;
    try {
        await api.updateGroup(props.group.id, { name: trimmed });
        emit('refresh');
        editingName.value = false;
    } catch (e: any) {
        alert('修改失败：' + (e.message || '未知错误'));
    } finally {
        savingName.value = false;
    }
}

// 描述编辑
const editingDesc = ref(false);
const editDesc = ref('');
const savingDesc = ref(false);

function startEditDesc() {
    editDesc.value = props.group.description || '';
    editingDesc.value = true;
}

function cancelEditDesc() {
    editingDesc.value = false;
    editDesc.value = '';
}

async function saveDesc() {
    savingDesc.value = true;
    try {
        await api.updateGroup(props.group.id, { description: editDesc.value.trim() });
        emit('refresh');
        editingDesc.value = false;
    } catch (e: any) {
        alert('修改失败：' + (e.message || '未知错误'));
    } finally {
        savingDesc.value = false;
    }
}

// 可见性切换
const savingVisibility = ref(false);

async function toggleVisibility() {
    savingVisibility.value = true;
    try {
        await api.updateGroup(props.group.id, { isPublic: !props.group.is_public });
        emit('refresh');
    } catch (e: any) {
        alert('切换失败：' + (e.message || '未知错误'));
    } finally {
        savingVisibility.value = false;
    }
}
//转让小组
function openTransferModal() {
    selectedUserId.value = null;  // ✅ 重置
    showTransferModal.value = true;
}
const selectedUserId = ref<number | null>(null); const transferableMembers = computed(() => {
    return (props.group.members || []).filter(
        (m: any) => m.id !== props.group.owner_id && m.role !== 'owner'
    );
});
const transferring = ref(false);

async function handleTransfer() {
    if (!selectedUserId.value) return;

    const target = transferableMembers.value.find((m: any) => m.id === selectedUserId.value);
    const targetName = target?.nickname || target?.email || '该成员';

    const confirmed = await confirm({
        title: '确认转让小组',
        message: `将小组转让给 ${targetName}？转让后你将成为管理员。`,
        icon: '👑',
        confirmText: '确认转让',
        cancelText: '取消',
    });

    if (!confirmed) return;

    transferring.value = true;
    try {
        await api.transferOwner(props.group.id, selectedUserId.value);
        await confirm({
            title: '转让成功',
            message: `小组已成功转让给 ${targetName}`,
            icon: '✅',
            confirmText: '我知道了',
            onlyOne: true,
        });
        showTransferModal.value = false;
        selectedUserId.value = null;
        emit('refresh');
    } catch (e: any) {
        await confirm({
            title: '转让失败',
            message: e.message || '未知错误',
            icon: '❌',
            confirmText: '我知道了',
            onlyOne: true,
        });
    } finally {
        transferring.value = false;
    }
}

// 解散小组
async function handleDissolve() {
    const confirmed = await confirm({
        title: '解散小组',
        message: '解散后，小组内所有成员、句子和动态都会被永久删除，此操作不可恢复。',
        icon: '⚠️',
        confirmText: '确认解散',
        cancelText: '取消',
    });

    if (!confirmed) return;

    try {
        await api.dissolveGroup(props.group.id);
        await confirm({
            title: '已解散',
            message: '小组已成功解散',
            icon: '✅',
            confirmText: '我知道了',
            onlyOne: true,
        });
        router.push('/groups');
    } catch (e: any) {
        await confirm({
            title: '解散失败',
            message: e.message || '未知错误',
            icon: '❌',
            confirmText: '我知道了',
            onlyOne: true,
        });
    }
}
</script>