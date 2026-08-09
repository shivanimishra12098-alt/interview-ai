/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        // Bind dev server to localhost only to avoid exposing it on the LAN
        host: '127.0.0.1',
        // Proxy API requests to the Python backend
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8010',
                changeOrigin: true,
            },
        },
        // Restrict file serving to the project directory
        fs: {
            strict: true,
            allow: [process.cwd()],
        },
    },
    preview: {
        host: '127.0.0.1',
    },
});
