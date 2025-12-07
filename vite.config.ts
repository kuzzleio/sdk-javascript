import path from "path";
import { defineConfig, Plugin } from "vite";
import { version } from "./package.json";

const ignoredModules = new Set<string>([
  "http",
  "package",
  "ws",
  "https",
  "url",
]);

const ignoreOptionalModules: Plugin = {
  load(id: string) {
    if (ignoredModules.has(id)) {
      return "export default {}";
    }
    return null;
  },
  name: "ignore-optional-modules",
  resolveId(source: any) {
    return ignoredModules.has(source) ? source : null;
  },
};

export default defineConfig({
  build: {
    lib: {
      // Use the TypeScript entry so Rollup sees ES modules and can generate a proper UMD bundle
      entry: path.resolve(__dirname, "index.ts"),
      fileName: () => "kuzzle",
      name: "KuzzleSDK",
      // Match the legacy Webpack output: single UMD bundle
      formats: ["umd"],
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        banner: `// Kuzzle Javascript SDK version ${version}`,
        // Expose build flags on the global scope for browser usage (mirrors old webpack define)
        intro: `var BUILT = true; var SDKVERSION = "${version}";`,
      },
    },
    sourcemap: true,
    target: "es2015",
  },
  define: {
    BUILT: true,
    SDKVERSION: JSON.stringify(version),
  },
  plugins: [ignoreOptionalModules],
});
