import vinext from "vinext";
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vinext()],
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  ssr: {
    external: ["swagger-ui-react", "@tinymce/tinymce-react", "prop-types"],
  },
});
