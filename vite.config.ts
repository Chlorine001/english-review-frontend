import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
const __dirname = import.meta.dirname; // 直接使用

export default defineConfig(({ mode }) => {
  // 加载环境变量（第三个参数 '' 表示加载所有变量，不限前缀）
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          // 从环境变量读取，若未设置则使用默认值
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
    },
  }
})