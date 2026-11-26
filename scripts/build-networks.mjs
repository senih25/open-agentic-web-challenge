import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templates = path.join(root, "config", "networks");
const mainPublic = path.join(root, "apps", "trustmesh-site", "public");
const partnerPublic = path.join(root, "apps", "partner-demo-site", "public");

const trustmeshOrigin = normalizeOrigin(
  process.env.TRUSTMESH_ORIGIN || "http://127.0.0.1:4173",
  "TRUSTMESH_ORIGIN",
);
const partnerOrigin = normalizeOrigin(
  process.env.PARTNER_ORIGIN || "http://localhost:4174",
  "PARTNER_ORIGIN",
);

function normalizeOrigin(value, name) {
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${name} must be an origin only, such as https://trustmesh.example.`);
  }
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && localHosts.has(url.hostname))) {
    throw new Error(`${name} must use HTTPS outside local development.`);
  }
  return url.origin;
}

async function readTemplate(name) {
  return readFile(path.join(templates, name), "utf8");
}

async function writePublic(directory, filename, content) {
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), content, "utf8");
}

async function generatePublicInputs() {
  const mainManifest = (await readTemplate("trustmesh-agent-manifest.json"))
    .replaceAll("__PARTNER_ORIGIN__", partnerOrigin);
  const mainHocon = (await readTemplate("trustmesh_services.hocon"))
    .replaceAll("__PARTNER_ORIGIN__", partnerOrigin);
  const partnerBridge = (await readTemplate("partner-bridge-actions.js"))
    .replaceAll("__TRUSTMESH_ORIGIN__", trustmeshOrigin);

  // Parse generated JSON before writing it; never ship a partially substituted manifest.
  const parsedMainManifest = JSON.parse(mainManifest);
  const parsedPartnerManifest = JSON.parse(await readTemplate("partner-agent-manifest.json"));
  const demoMock = process.env.TRUSTMESH_DEMO_MOCK === "true";
  const loopbackOrigins = [trustmeshOrigin, partnerOrigin].every((origin) => {
    const host = new URL(origin).hostname;
    return ["localhost", "127.0.0.1", "[::1]"].includes(host);
  });
  if (demoMock && !loopbackOrigins) {
    throw new Error("TRUSTMESH_DEMO_MOCK is allowed only with local loopback origins; refusing a public mock build.");
  }
  if (demoMock) {
    // Local-only, deterministic browser mock; production builds remain BYOK by default.
    parsedMainManifest.llm_router = {
      ...parsedMainManifest.llm_router,
      base_url: "browser://mock",
      mock: true,
    };
  }
  if (!parsedMainManifest.allowed_peers?.includes(partnerOrigin)) {
    throw new Error("TrustMesh manifest did not receive the configured partner origin.");
  }
  if (parsedMainManifest.networks?.[0]?.name !== "trustmesh_services") {
    throw new Error("Unexpected TrustMesh network name.");
  }
  if (parsedPartnerManifest.networks?.[0]?.name !== "open_housing_guide") {
    throw new Error("Unexpected partner network name.");
  }
  if (!mainHocon.includes(`"${partnerOrigin}/open_housing_guide"`)) {
    throw new Error("TrustMesh HOCON did not receive the configured partner network URL.");
  }
  if (!partnerBridge.includes(`callerOrigins: ["${trustmeshOrigin}"]`)) {
    throw new Error("Partner bridge did not receive the configured TrustMesh caller origin.");
  }

  await writePublic(mainPublic, "agent-manifest.json", JSON.stringify(parsedMainManifest, null, 2));
  await writePublic(mainPublic, "trustmesh_services.hocon", mainHocon);
  await writePublic(mainPublic, "links.json", await readTemplate("trustmesh-links.json"));

  await writePublic(partnerPublic, "agent-manifest.json", await readTemplate("partner-agent-manifest.json"));
  await writePublic(partnerPublic, "open_housing_guide.hocon", await readTemplate("open_housing_guide.hocon"));
  await writePublic(partnerPublic, "links.json", await readTemplate("partner-links.json"));
  await writePublic(path.join(partnerPublic, "bridge"), "bridge-actions.js", partnerBridge);
}

function buildNetwork({ hocon, manifest, runtime }) {
  const script = path.join(root, "packages", "conformance", "scripts", "build_network.mjs");
  execFileSync(process.execPath, [
    script,
    hocon,
    "--manifest", manifest,
    "--runtime", runtime,
  ], { cwd: root, stdio: "inherit" });
}

await generatePublicInputs();
buildNetwork({
  hocon: path.join(mainPublic, "trustmesh_services.hocon"),
  manifest: path.join(mainPublic, "agent-manifest.json"),
  runtime: path.join(mainPublic, "runtime"),
});
buildNetwork({
  hocon: path.join(partnerPublic, "open_housing_guide.hocon"),
  manifest: path.join(partnerPublic, "agent-manifest.json"),
  runtime: path.join(partnerPublic, "runtime"),
});

process.stdout.write(
  `Built both networks for TrustMesh ${trustmeshOrigin} and partner ${partnerOrigin}.\n`,
);
