import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to read the dynamically assigned port from the backend
let backendPort = '3000'
try {
  const portPath = path.resolve(__dirname, '../.dashboard-port')
  if (fs.existsSync(portPath)) {
    backendPort = fs.readFileSync(portPath, 'utf8').trim()
  }
} catch (e) {
  // Fallback to 3000
}

const target = backendPort && backendPort !== '0' ? `http://127.0.0.1:${backendPort}` : 'http://127.0.0.1:3000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target,
        changeOrigin: true
      },
      '/socket.io': {
        target,
        changeOrigin: true,
        ws: true
      }
    }
  }
})
