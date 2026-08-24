import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.PAGES === 'true' ? '/portal-imoveis/' : '/',
  plugins: [react(), tailwindcss()],
})
