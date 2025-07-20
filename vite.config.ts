import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  root: "./client",
  server: {
    host: "0.0.0.0",
    port: 5000,
    proxy: mode === 'development' ? {
      "/api": {
        target: "http://0.0.0.0:3001",
        changeOrigin: true,
      },
    } : undefined,
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.html"),
    },
  },
}));