import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Update these if your mkcert generated different filenames
// /Users/tareqabd/Library/Application Support/Herd/config/valet/Certificates
const CERT_DIR = `${process.env.HOME}/Library/Application Support/Herd/config/valet/Certificates`;
const CERT_KEY = path.join(CERT_DIR, "ahsa-health-cluster.test.key");
const CERT_FILE = path.join(CERT_DIR, "ahsa-health-cluster.test.crt");

export default defineConfig({
  server: {
    host: "ahsa-health-cluster.test", // must match certificate CN
    port: 3000,
    https: {
      key: fs.readFileSync(CERT_KEY),
      cert: fs.readFileSync(CERT_FILE),
    },
    proxy: {
      // Proxy all Laravel backend requests securely
      "/api": {
        target: "https://ahsa-health-cluster.test",
        changeOrigin: true,
        secure: false, // ensure HTTPS
      },
      "/sanctum": {
        target: "https://ahsa-health-cluster.test",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      protocol: "wss",
      host: "ahsa-health-cluster.test", // must match HTTPS host
      port: 3000,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
