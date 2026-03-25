import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const githubPagesBase = repositoryName ? `/${repositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? githubPagesBase : '/',
  plugins: [react()],
  server: {
    host: 'auth.laravel-api-for-microfrontend.test',
    port: 5173,
    strictPort: true,
    allowedHosts: ['user.laravel-api-for-microfrontend.test', 'auth.laravel-api-for-microfrontend.test'],
  },
})
