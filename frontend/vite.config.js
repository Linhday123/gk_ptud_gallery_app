import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/login": "http://localhost:8000",
      "/register": "http://localhost:8000",
      "/photos": "http://localhost:8000",
      "/uploads": "http://localhost:8000",
    },
  },
});
