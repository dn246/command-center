import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Production build is served from https://dn246.github.io/command-center/ on
  // GitHub Pages; the dev server stays at the root path.
  base: command === 'build' ? '/command-center/' : '/',
  plugins: [react(), tailwindcss()],
}))
