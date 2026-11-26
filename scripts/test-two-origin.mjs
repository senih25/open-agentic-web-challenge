import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");
const mainUrl = "http://127.0.0.1:4173/";
const partnerUrl = "http://localhost:4174/";
const children = [];

async function isReachable(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1200) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitFor(url, child, label) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`${label} server exited early (code ${child.exitCode}).`);
    }
    if (await isReachable(url)) return;
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

function startServer(config, host, port, url, label) {
  const child = spawn(process.execPath, [
    viteBin, "--config", config, "--host", host, "--port", String(port), "--strictPort",
  ], { cwd: root, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  let output = "";
  child.stdout.on("data", (chunk) => { output = (output + chunk.toString()).slice(-6000); });
  child.stderr.on("data", (chunk) => { output = (output + chunk.toString()).slice(-6000); });
  children.push(child);
  return waitFor(url, child, label).catch((error) => {
    throw new Error(`${error.message}\n${output}`);
  });
}

function runNode(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
  });
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  if (result.status !== 0) {
    throw new Error(`${path.basename(script)} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

async function ensureServer(url, config, host, port, label) {
  if (await isReachable(url)) {
    process.stdout.write(`Reusing existing ${label} server at ${url}\n`);
    return;
  }
  await startServer(config, host, port, url, label);
  process.stdout.write(`Started ${label} server at ${url}\n`);
}

try {
  // The checker must work from a clean checkout, not rely on runtime assets left by
  // a developer's earlier build or ignored files in the workspace.
  runNode(path.join(root, "scripts", "sync-runtime.mjs"));
  runNode(path.join(root, "scripts", "build-networks.mjs"));
  await Promise.all([
    ensureServer(mainUrl, "vite.config.ts", "127.0.0.1", 4173, "TrustMesh"),
    ensureServer(partnerUrl, "vite.partner.config.ts", "localhost", 4174, "Open Housing Guide"),
  ]);

  const main = await fetch(new URL("agent-manifest.json", mainUrl));
  const partner = await fetch(new URL("agent-manifest.json", partnerUrl));
  if (!main.ok || !partner.ok) throw new Error("One or both public manifests were not served successfully.");

  const mainManifest = await main.json();
  const partnerManifest = await partner.json();
  if (!mainManifest.allowed_peers?.includes("http://localhost:4174")) {
    throw new Error("TrustMesh does not allowlist the configured partner origin.");
  }
  if (partnerManifest.networks?.[0]?.name !== "open_housing_guide") {
    throw new Error("Unexpected partner network manifest.");
  }

  runNode(path.join(root, "packages", "conformance", "scripts", "check_partner.mjs"), [
    "http://localhost:4174/open_housing_guide",
    "--origin",
    "http://127.0.0.1:4173",
  ]);

  process.stdout.write("PASS: two distinct origins, public manifests, CORS, resolved network and read-only bridge verified.\n");
} finally {
  for (const child of children.reverse()) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
}
