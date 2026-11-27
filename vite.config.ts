import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/3d-page-flip/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        reader: fileURLToPath(new URL("./reader.html", import.meta.url)),
      },
    },
  },
});
