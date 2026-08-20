import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
   resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),   // 关键配置
    },
  },server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',   // 明确使用 IPv4
        changeOrigin: true,
      }
    }
  }
})