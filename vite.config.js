import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugin tailwindcss() inilah yang membuat semua class (rounded-2xl, bg-[#...], dst) bekerja.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
