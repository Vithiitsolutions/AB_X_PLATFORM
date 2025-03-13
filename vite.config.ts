import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
// import deno from "@deno/vite-plugin";
import autoprefixer from "autoprefixer";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
        usePolling: true,
        input: ["./server/app.ts"],
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      }
      : {
        // input: ["./components/Card.tsx", "./components/Text.tsx"],
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  plugins: [tailwindcss(), reactRouter()],
}));
