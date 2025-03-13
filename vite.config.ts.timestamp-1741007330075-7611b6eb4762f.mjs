// vite.config.ts
import { defineConfig } from "file:///C:/Users/Vithi/mercuryx-platform/node_modules/vite/dist/node/index.js";
import { reactRouter } from "file:///C:/Users/Vithi/mercuryx-platform/node_modules/@react-router/dev/dist/vite.js";
import autoprefixer from "file:///C:/Users/Vithi/mercuryx-platform/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwindcss from "file:///C:/Users/Vithi/mercuryx-platform/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild ? {
      usePolling: true,
      input: ["./server/app.ts"],
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    } : {
      // input: ["./components/Card.tsx", "./components/Text.tsx"],
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  css: {
    postcss: {
      plugins: [autoprefixer]
    }
  },
  plugins: [tailwindcss(), reactRouter()]
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlUm9vdCI6ICJDOlxcVXNlcnNcXFZpdGhpXFxtZXJjdXJ5eC1wbGF0Zm9ybVxcIiwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxWaXRoaVxcXFxtZXJjdXJ5eC1wbGF0Zm9ybVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcVml0aGlcXFxcbWVyY3VyeXgtcGxhdGZvcm1cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL1ZpdGhpL21lcmN1cnl4LXBsYXRmb3JtL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHsgcmVhY3RSb3V0ZXIgfSBmcm9tIFwiQHJlYWN0LXJvdXRlci9kZXYvdml0ZVwiO1xyXG4vLyBpbXBvcnQgZGVubyBmcm9tIFwiQGRlbm8vdml0ZS1wbHVnaW5cIjtcclxuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tIFwiYXV0b3ByZWZpeGVyXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGlzU3NyQnVpbGQgfSkgPT4gKHtcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczogaXNTc3JCdWlsZFxyXG4gICAgICA/IHtcclxuICAgICAgICB1c2VQb2xsaW5nOiB0cnVlLFxyXG4gICAgICAgIGlucHV0OiBbXCIuL3NlcnZlci9hcHAudHNcIl0sXHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uanNgLFxyXG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLmpzYCxcclxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5bZXh0XWAsXHJcbiAgICAgICAgfSxcclxuICAgICAgfVxyXG4gICAgICA6IHtcclxuICAgICAgICAvLyBpbnB1dDogW1wiLi9jb21wb25lbnRzL0NhcmQudHN4XCIsIFwiLi9jb21wb25lbnRzL1RleHQudHN4XCJdLFxyXG4gICAgICAgIG91dHB1dDoge1xyXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLmpzYCxcclxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5qc2AsXHJcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogYGFzc2V0cy9bbmFtZV0uW2V4dF1gLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHBvc3Rjc3M6IHtcclxuICAgICAgcGx1Z2luczogW2F1dG9wcmVmaXhlcl0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW3RhaWx3aW5kY3NzKCksIHJlYWN0Um91dGVyKCldLFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFIsU0FBUyxvQkFBb0I7QUFDdlQsU0FBUyxtQkFBbUI7QUFFNUIsT0FBTyxrQkFBa0I7QUFFekIsT0FBTyxpQkFBaUI7QUFFeEIsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxXQUFXLE9BQU87QUFBQSxFQUMvQyxPQUFPO0FBQUEsSUFDTCxlQUFlLGFBQ1g7QUFBQSxNQUNBLFlBQVk7QUFBQSxNQUNaLE9BQU8sQ0FBQyxpQkFBaUI7QUFBQSxNQUN6QixRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0YsSUFDRTtBQUFBO0FBQUEsTUFFQSxRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxFQUNKO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxTQUFTLENBQUMsWUFBWTtBQUFBLElBQ3hCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDeEMsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
