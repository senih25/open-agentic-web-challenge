import { defineConfig } from "vite";

export default defineConfig({
  root: "apps/trustmesh-site",
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: "../../dist/trustmesh-site",
    emptyOutDir: true,
    sourcemap: false,
  },
});
