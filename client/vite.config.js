import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 9898, // change the port
    open: true, // automatically open this
  },
  // Add this to ensure build stability on Render
  build: {
    outDir: "dist",
    sourcemap: false, // Reduces memory usage during build
  },
});
