import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  publicDir: "public",
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep hosts.yml in the root of dist folder
          if (assetInfo.name === "hosts.yml") {
            return "[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
