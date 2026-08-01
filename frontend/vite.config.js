import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    // Listen on all network interfaces
    host: "0.0.0.0",

    // Allow requests coming from your domain
    allowedHosts: [
      "cloudcodes.online",
      ".cloudcodes.online",
    ],

    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});