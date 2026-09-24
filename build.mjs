import { chmodSync } from "node:fs";
import { build } from "esbuild";

await build({
  entryPoints: ["src/cli.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: "dist/cli.js",
  banner: { js: "#!/usr/bin/env node" },
  legalComments: "none",
});
chmodSync("dist/cli.js", 0o755);

await build({
  entryPoints: ["src/web/main.ts"],
  bundle: true,
  platform: "browser",
  format: "esm",
  target: "es2020",
  outfile: "site/app.js",
  minify: true,
  legalComments: "none",
});
