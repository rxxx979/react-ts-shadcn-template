import { resolve } from "path";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
      "~": resolve(import.meta.dirname, "."),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // 按依赖域拆 vendor；图表在 Components 内部单独懒加载，避免和页面 chunk 成环
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
              priority: 100,
              includeDependenciesRecursively: false,
            },
            {
              name: "router",
              test: /node_modules[\\/]react-router[\\/]/,
              priority: 90,
              includeDependenciesRecursively: false,
            },
            {
              name: "table",
              test: /node_modules[\\/](@tanstack|@dnd-kit)[\\/]/,
              priority: 80,
              includeDependenciesRecursively: false,
            },
            {
              name: "icons",
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 55,
              includeDependenciesRecursively: false,
            },
            {
              name: "base-ui",
              test: /node_modules[\\/]@base-ui[\\/]/,
              priority: 54,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
});
