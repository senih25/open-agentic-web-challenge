import { defineConfig } from "vite";

export default defineConfig({
  root: "apps/partner-demo-site",
  server: {
    host: "localhost",
    port: 4174,
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  preview: {
    host: "localhost",
    port: 4174,
    strictPort: true,
  },
  build: {
    outDir: "../../dist/partner-demo-site",
    emptyOutDir: true,
    sourcemap: false,
  },
});
