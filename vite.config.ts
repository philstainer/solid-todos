import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  base: "/solid-todos/",
  plugins: [solidPlugin()],
  server: {
    port: 3005,
  },
  build: {
    target: "esnext",
  },
});
