import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,     // WSL/도커면 true로 바꿔도 됨
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',   // 브라우저가 접속하는 호스트명
      port: 5173,          // 브라우저가 연결할 WS 포트
    },
    proxy: {
      '/api':    { target: 'http://localhost:8080', changeOrigin: true },
      '/oauth2': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});