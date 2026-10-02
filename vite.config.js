import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "process";

// Saat build, isi file CSS dimasukkan langsung ke index.html (<style>)
// supaya browser tidak perlu request CSS terpisah sebelum menampilkan halaman.
function inlineCssPlugin() {
  return {
    name: "inline-css",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        let result = html;
        for (const [fileName, asset] of Object.entries(ctx.bundle)) {
          if (asset.type !== "asset" || !fileName.endsWith(".css")) continue;
          const linkTag = new RegExp(`<link[^>]*href="/${fileName}"[^>]*>`);
          if (!linkTag.test(result)) continue;
          result = result.replace(linkTag, () => `<style>${asset.source}</style>`);
          delete ctx.bundle[fileName];
        }
        return result;
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), inlineCssPlugin()],
    // host & allowedHosts: agar bisa diakses lewat domain hasil deploy,
    // bukan hanya dari localhost. Vite otomatis mengarahkan path seperti
    // /auth/login ke index.html (SPA fallback) di mode dev & preview.
    server: {
      port: Number(env.APP_PORT) || 3000,
      host: true,
      allowedHosts: true,
    },
    preview: {
      port: Number(env.APP_PORT) || 3000,
      host: true,
      allowedHosts: true,
      // Meniru proxy di vercel.json saat menjalankan "bun run preview"
      proxy: {
        "/api/v1": { target: "https://open-api.delcom.org", changeOrigin: true },
        "/img": { target: "https://open-api.delcom.org", changeOrigin: true },
      },
    },
    define: {
      DELCOM_BASEURL: JSON.stringify(
        env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        include: ["src/**/*.{js,jsx,ts,tsx}"],
        exclude: [
          "src/main.jsx",
          "src/setupTests.js",
          "src/test-utils.jsx",
          "**/*.test.{js,jsx}",
          "node_modules/**",
        ],
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  };
});