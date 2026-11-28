import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

function normalizeBasePath(raw: string): string {
  const trimmed = raw.trim().replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}/` : "/";
}

function resolveBase(): string {
  if (process.env.BASE_PATH !== undefined) {
    return normalizeBasePath(process.env.BASE_PATH);
  }
  return process.env.GITHUB_PAGES === "true" ? "/dropp/" : "/";
}

export default defineConfig({
  base: resolveBase(),
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        reader: fileURLToPath(new URL("./reader.html", import.meta.url)),
        settings: fileURLToPath(new URL("./settings.html", import.meta.url)),
      },
    },
  },
});
