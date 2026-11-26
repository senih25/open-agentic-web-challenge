import { cp, copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "packages", "web-runtime");
const publicTargets = [
  path.join(root, "apps", "trustmesh-site", "public", "runtime"),
  path.join(root, "apps", "partner-demo-site", "public", "runtime"),
];
const allowedExtensions = new Set([".js", ".mjs"]);
const entries = await readdir(source, { withFileTypes: true });

for (const target of publicTargets) {
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });

  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);

    if (entry.isDirectory() && entry.name === "generated") {
      await cp(from, to, { recursive: true });
    } else if (entry.isFile() && allowedExtensions.has(path.extname(entry.name))) {
      await copyFile(from, to);
    } else if (entry.isFile() && entry.name === "LICENSE.txt") {
      await copyFile(from, to);
    }
  }
}

process.stdout.write("Synchronized the patched browser runtime to both public sites.\n");
