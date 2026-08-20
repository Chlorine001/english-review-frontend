/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 或 'class'（手动切换），推荐 'media' 自动跟随系统
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 自定义暗色主题颜色（可选）
        dark: {
          bg: '#1a1b2e',
          card: '#2d2f44',
          border: '#3d3f5e',
        }
      }
    },
  },
  plugins: [],
}