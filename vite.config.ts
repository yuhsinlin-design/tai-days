import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Honor the PORT assigned by the preview manager (autoPort); fall back to 5173.
    port: Number(process.env.PORT) || 5173
  }
})
