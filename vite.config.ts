import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // غيرنا المسار عشان يقرأ الملفات من المجلد الحالي طوالي
  base: './', 
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
