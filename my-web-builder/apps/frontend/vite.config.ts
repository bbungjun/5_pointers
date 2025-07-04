import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // TypeScript 관련 경고 무시
        if (warning.code === 'UNRESOLVED_IMPORT') return
        warn(warning)
      }
    }
  },
  esbuild: {
    // TypeScript 체크 비활성화
    tsconfigRaw: {
      compilerOptions: {
        skipLibCheck: true,
        allowJs: true,
        checkJs: false
      }
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      },
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      }
    }
  }
})
