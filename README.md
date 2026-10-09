# LexiScribe

[![Vue](https://img.shields.io/badge/Vue-3-42b883.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8.svg)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](LICENSE)

> 智能英语句子间隔复习系统 —— 把你真正想记住的英语，在快要忘记的时候再次呈现

一个面向个人英语学习的轻量级 Web 应用。用户保存喜欢的英语句子，系统根据每次复习的表现自动安排下一次复习时间，形成个人化的英语语料库。

## ✨ 功能特性

- 🔐 **用户系统** — 注册 / 登录 / 邮箱验证 / 未验证功能受限提示
- 📝 **句子管理** — 添加、编辑、删除、搜索、排序、分页
- 🔁 **间隔复习** — 复习队列、显示答案、四级评价、进度追踪
- 🎵 **媒体播放** — 音频/视频上传、内嵌播放、播放器组件复用
- 📊 **学习统计** — 学习进度分布、今日复习、连续学习天数（Streak）
- 🏆 **积分系统** — 等级徽章、积分流水、排行榜
- 📨 **邀请系统** — 专属邀请链接、二维码分享、邀请记录
- 👥 **小组协作** — 创建/加入小组、成员管理、句子分享、动态
- 🤖 **AI 识别** — 上传音视频，AI 自动转录 + 翻译，一键填入表单
- 🎵 **音频格式转换** — 基于 FFmpeg.wasm，全本地处理，文件不出设备
- 🌙 **深色模式** — 浅色/深色主题切换，跟随系统或手动选择
- 📱 **响应式设计** — 手机 / 平板 / 桌面全适配
- 📲 **PWA** — 可安装到桌面，支持离线访问静态资源

## 🛠️ 技术栈

| 类别 | 技术 |
| :--- | :--- |
| **框架** | Vue 3 (组合式 API) |
| **语言** | TypeScript |
| **构建工具** | Vite |
| **样式** | Tailwind CSS |
| **路由** | Vue Router 4 |
| **HTTP 客户端** | Axios |
| **音频波形** | Wavesurfer.js |
| **截图生成** | html2canvas |
| **PWA** | vite-plugin-pwa |
| **音频转换** | FFmpeg.wasm |

## 📁 项目结构

```
src/
├── views/
│   ├── auth/             # 登录、注册、验证邮箱
│   ├── profile/          # 个人中心、积分
│   ├── groups/           # 小组
│   ├── Dashboard.vue     # 首页
│   ├── Review.vue        # 复习
│   ├── AddSentence.vue   # 添加句子（含 AI 识别）
│   ├── Library.vue       # 句子库
│   └── AudioConverter.vue# 音频格式转换
│   
├── components/
│   ├── MediaPlayer.vue   # 媒体播放器
│   ├── ConfirmDialog.vue # 确认弹窗
│   ├── RangeSlider.vue   # 区间滑块
│   └── NotFound.vue      # 404
│ 
├── utils/
│   ├── time.ts           # 时间格式化（北京时间）
│   ├── useTTS.ts         # 语音合成
│   └── verifyCheck.ts    # 邮箱验证检查
│ 
├── api/
│   ├── index.ts          # API 客户端
│   └── axios.ts          # Axios 实例 + 401 拦截
│ 
├── router/
│   └── index.ts          # 路由配置 + 守卫
└── style.css             # 全局样式
```

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

> **注意**：需要同时启动后端服务（`english-review-backend`），前端通过 Vite 代理（由于Cloudflare限制，所以本项目直接访问后端地址）连接 `http://localhost:8787`。

## 🏗️ 构建与部署

```bash
# 构建
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist
```

## 🔧 Vite 代理配置

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8787',
      changeOrigin: true,
    }
  }
}
```

## 📌 关键设计

- **统一时间显示**：后端存 UTC，前端用 `formatBeijingTime` 转北京时间
- **组件复用**：`MediaPlayer`、`RangeSlider`、`ConfirmDialog` 等组件跨页面复用
- **逻辑与 UI 分离**：`composables` 封装可复用逻辑，组件只负责渲染
- **PWA 只缓存静态资源**：API 请求不走 Service Worker，避免跨域问题

## 🌐 在线体验

- [Lexiscribe](https://lexiscribe.cdragon.win)

## 📄 License

MIT

---

**Made with ❤️ by [Dragon](https://github.com/Chlorine001)**
