import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["iife"],
  globalName: "prevuiw",
  outDir: "dist",
  splitting: false,
  minify: true,
  sourcemap: true,
  target: "es2017",
  platform: "browser",
  outExtension: () => ({ js: ".global.js" }),
  clean: true,
  noExternal: [/.*/],
});
