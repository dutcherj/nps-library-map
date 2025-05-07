// tools/make‑manifest.js   (CommonJS, no config required)
const fs = require("fs");
const path = require("path");

const dataDir = path.resolve(__dirname, "../data");

const files = fs
  .readdirSync(dataDir)
  .filter((f) => f.toLowerCase().endsWith(".geojson"))
  .map((f) => `data/${f}`);

fs.writeFileSync(
  path.join(dataDir, "manifest.json"),
  JSON.stringify(files, null, 2)
);

console.log(`✔  Wrote data/manifest.json with ${files.length} files`);
