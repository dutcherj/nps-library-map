import { readdir, writeFile } from "fs/promises";

const files = (await readdir("./data"))
  .filter(f => f.toLowerCase().endsWith(".geojson"))
  .map(f => `data/${f}`);

await writeFile("./data/manifest.json", JSON.stringify(files, null, 2));
console.log("✔  Wrote data/manifest.json with", files.length, "files");
