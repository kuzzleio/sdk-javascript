import path from "path";
import { defineConfig, Plugin } from "vite";
import { version } from "./package.json";

const ignoredModules = new Set<string>([
  "http",
  "min-req-promise",
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
      fileName: () => "kuzzle.js",
      formats: ["umd"],
      name: "KuzzleSDK",
    },
    outDir: "dist",
    rollupOptions: {
      output: {
        banner: `// Kuzzle Javascript SDK version ${version}`,
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
