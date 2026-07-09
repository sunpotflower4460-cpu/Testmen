import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built app can be opened from any static host or subpath.
export default defineConfig({
  base: './',
  plugins: [react()],
})
