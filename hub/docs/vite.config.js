import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// どのフォルダに置いても開けるように、パスは相対にする。
export default defineConfig({
    base: './',
    plugins: [react()],
});
