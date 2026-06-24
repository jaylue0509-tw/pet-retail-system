import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // NOTE：本地開發時，將 /api 請求代理到 FastAPI 後端
  // Vercel 生產環境由 vercel.json 的 experimentalServices.routePrefix 處理
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
