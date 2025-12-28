import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // السطر ده حيخلي الملفات تتقري صح حتى لو في مجلد فرعي
  base: '', 
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
