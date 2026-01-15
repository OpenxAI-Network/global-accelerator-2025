import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     // Proxy API requests
  //     '/generate': 'http://localhost:3001',
  //     '/followup': 'http://localhost:3001',
  //     '/retry': 'http://localhost:3001',
  //     '/image-proxy': 'http://localhost:3001', 
  //   }
  // }
})