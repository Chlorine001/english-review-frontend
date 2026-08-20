<template>
  <div class="max-w-xl mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4">添加句子</h2>
    <form @submit.prevent="submit">
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">英文句子 *</label>
        <textarea v-model="form.content" rows="3" class="w-full border rounded px-3 py-2" required></textarea>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">中文含义</label>
        <input v-model="form.translation" class="w-full border rounded px-3 py-2" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">发音/音标</label>
        <input v-model="form.pronunciation" class="w-full border rounded px-3 py-2" />
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">备注</label>
        <textarea v-model="form.notes" rows="2" class="w-full border rounded px-3 py-2"></textarea>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1">来源</label>
        <input v-model="form.source" class="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">保存</button>
      <router-link to="/" class="ml-4 text-gray-600 underline">取消</router-link>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const form = reactive({
  content: '',
  translation: '',
  pronunciation: '',
  notes: '',
  source: '',
});

async function submit() {
  try {
    await api.addSentence(form);
    router.push('/');
  } catch (e: any) {
    alert(e.message);
  }
}
</script>