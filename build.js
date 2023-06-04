import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/main.ts"],
    outbase: "./src",
    bundle: true,
    format: "esm",
    target: "esnext",
    platform: "browser",
    outfile: "web/main.js",
    sourcesContent: false,
    minify: true,
    tsconfig: "./tsconfig.json",
});
