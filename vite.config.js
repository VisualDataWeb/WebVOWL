// vite.config.js
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  base: "./",
  build: {
    outDir: "deploy",
    commonjsOptions: { transformMixedEsModules: true }, // Change
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "./index.html"),
      output: {
        manualChunks: {
          d3: ["d3"],
          app: ["./src/app/js/entry.js"],
          webvowl: ["./src/webvowl/js/entry.js"],
        },
      },
    },
  },
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          version: process.env.npm_package_version,
          vowlStyles: '<link rel="stylesheet" href="css/vowl.css">',
        },
      },
    }),
    viteStaticCopy({
      targets: [
        { src: "node_modules/d3/d3.min.js", dest: "js" },
        { src: "src/favicon.ico", dest: "" },
        { src: "license.txt", dest: "" },
      ],
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/convert": "http://localhost:8080", // OWL2VOWL service
    },
  },
});
