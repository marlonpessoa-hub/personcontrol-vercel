import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD__: JSON.stringify(new Date().toISOString())
  },
  server: {
    port: 3000,
    open: true
  }
})
