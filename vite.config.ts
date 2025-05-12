import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
// This configuration file sets up a Vite project with React support and excludes the 'lucide-react' package from dependency optimization.
// It uses the `defineConfig` function from Vite to create a configuration object.
// The `react` plugin is included to enable React features in the Vite build process.
// The `optimizeDeps` option is used to exclude the 'lucide-react' package from dependency optimization, which can help avoid issues with certain packages that may not be compatible with Vite's optimization process.