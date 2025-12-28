import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // السطر ده هو البيفتح الصفحة البيضاء
  base: '/Lasttest/', 
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
