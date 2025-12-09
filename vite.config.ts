import path from "path";
import { defineConfig } from "vite";
import { version } from "./package.json";

export default defineConfig({
  build: {
    lib: {
      // Use the TypeScript entry so Rollup sees ES modules and can generate a proper UMD bundle
      entry: path.resolve(__dirname, "index.ts"),
      fileName: () => "kuzzle.js",
      name: "KuzzleSDK",
      // Match the legacy Webpack output: single UMD bundle
      formats: ["umd"],
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        banner: `// Kuzzle Javascript SDK version ${version}`,
        // Expose build flags on the global scope for browser usage (mirrors old webpack define)
      },
    },
    sourcemap: true,
    target: "es2015",
  },
  define: {
    SDKVERSION: JSON.stringify(version),
  },
  plugins: [],
});
