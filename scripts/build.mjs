import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const dist = resolve(root, "dist");

if (dist === root || !dist.startsWith(`${root}\\`) && !dist.startsWith(`${root}/`)) {
  throw new Error("Refusing to clean an unsafe output path");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of ["index.html", "404.html", "styles.css", "script.js", ".nojekyll"]) {
  await copyFile(join(root, file), join(dist, file));
}

await mkdir(join(dist, "assets"), { recursive: true });
await cp(join(root, "assets", "images"), join(dist, "assets", "images"), { recursive: true });
await cp(join(root, "about-us"), join(dist, "about-us"), { recursive: true });

console.log(`Built static site in ${dist}`);
