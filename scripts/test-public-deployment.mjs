import { strict as assert } from "node:assert";
import { setTimeout as delay } from "node:timers/promises";

const callerOrigin = "https://trustmesh-agentic-web.pages.dev";
const partnerOrigin = "https://trustmesh-open-housing-guide.pages.dev";
const callerAgent = "trustmesh_assistant";
const partnerAgent = "housing_guide_assistant";
const results = [];

async function get(origin, path, { cors = true, allowSameOriginRedirect = false } = {}) {
  const url = new URL(path, origin);
  const response = await fetch(url, {
    headers: { Origin: origin === callerOrigin ? partnerOrigin : callerOrigin },
    signal: AbortSignal.timeout(15000),
    redirect: "follow",
  });
  assert.equal(response.status, 200, `${url} returned HTTP ${response.status}`);
  assert.equal(new URL(response.url).origin, origin, `${url} redirected outside its origin`);
  if (cors) {
    assert.equal(response.headers.get("access-control-allow-origin"), "*", `${url} is missing public CORS`);
  }
  results.push({ url: url.href, status: response.status, finalUrl: response.url });
  return response;
}

try {
  await get(callerOrigin, "/");
  await get(partnerOrigin, "/");

  const [callerManifestResponse, callerNetworkResponse, callerLinksResponse, callerRuntimeResponse] = await Promise.all([
    get(callerOrigin, "/agent-manifest.json"),
    get(callerOrigin, "/trustmesh_services.network.json"),
    get(callerOrigin, "/links.json"),
    get(callerOrigin, "/runtime/index.js"),
  ]);
  const [partnerManifestResponse, partnerNetworkResponse, partnerLinksResponse, bridgePageResponse, partnerRuntimeResponse, bridgeManifestResponse, bridgeActionsResponse] = await Promise.all([
    get(partnerOrigin, "/agent-manifest.json"),
    get(partnerOrigin, "/open_housing_guide.network.json"),
    get(partnerOrigin, "/links.json"),
    get(partnerOrigin, "/bridge/action-bridge.html", { allowSameOriginRedirect: true }),
    get(partnerOrigin, "/runtime/index.js"),
    get(partnerOrigin, "/bridge/agent-manifest.json"),
    get(partnerOrigin, "/bridge/bridge-actions.js"),
  ]);

  const callerManifest = await callerManifestResponse.json();
  const callerNetwork = await callerNetworkResponse.json();
  const callerLinks = await callerLinksResponse.json();
  const partnerManifest = await partnerManifestResponse.json();
  const partnerNetwork = await partnerNetworkResponse.json();
  const partnerLinks = await partnerLinksResponse.json();
  const bridgeManifest = await bridgeManifestResponse.json();
  const bridgeActions = await bridgeActionsResponse.text();
  const bridgeHtml = await bridgePageResponse.text();

  assert(callerManifest.allowed_peers?.includes(partnerOrigin), "Caller manifest does not allowlist the partner origin.");
  assert(callerNetwork.tools?.some((agent) => agent.name === callerAgent), "Caller resolved network does not publish the TrustMesh front agent.");
  const callerFront = callerNetwork.tools.find((agent) => agent.name === callerAgent);
  assert(callerFront.tools?.includes(partnerOrigin + "/open_housing_guide"), "Caller front agent does not reference the production partner network.");
  assert(partnerManifest.networks?.some((network) => network.name === "open_housing_guide"), "Partner manifest does not publish Open Housing Guide.");
  assert(partnerNetwork.tools?.some((agent) => agent.name === partnerAgent), "Partner resolved network does not publish the housing guide front agent.");
  assert.equal(bridgeManifest.networks?.[0]?.name, "open_housing_guide", "Bridge manifest points to the wrong partner network.");
  const callerOriginsMatch = bridgeActions.match(/callerOrigins\s*:\s*(\[[^\]]+\])/);
  assert(callerOriginsMatch, "Partner bridge has no callerOrigins declaration.");
  const callerOrigins = JSON.parse(callerOriginsMatch[1]);
  assert.deepEqual(callerOrigins, [callerOrigin], "Partner bridge callerOrigins does not exactly match the TrustMesh origin.");
  assert(callerLinks && typeof callerLinks === "object", "Caller links metadata is invalid.");
  assert(partnerLinks && typeof partnerLinks === "object", "Partner links metadata is invalid.");
  assert(bridgeHtml.toLowerCase().includes("action bridge") || bridgeHtml.toLowerCase().includes("agent"), "Action bridge HTML did not load expected bridge document.");
  assert(callerRuntimeResponse.status === 200 && partnerRuntimeResponse.status === 200, "Runtime modules did not load.");

  console.log(JSON.stringify({
    result: "PASS",
    callerOrigin,
    partnerOrigin,
    resources: results,
    callerAllowedPeers: callerManifest.allowed_peers,
    callerNetwork: callerNetwork.name,
    partnerNetwork: partnerNetwork.name,
    bridgeCallerOrigins: callerOrigins,
  }, null, 2));
} catch (error) {
  console.error("PUBLIC_DEPLOYMENT_CHECK_FAILED:", error?.stack || error);
  process.exitCode = 1;
}
