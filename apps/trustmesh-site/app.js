import {
  approvePeerRequest,
  createDisclosureReceipt,
  preparePeerRequest,
  verifyDisclosureReceipt,
} from "../../packages/delegation-gateway/src/index.ts";

const PEER = {
  url: "https://benefits.example/guide",
  origin: "https://benefits.example",
  agentName: "public_benefits_guide",
  capabilityName: "find_public_guidance",
  manifestDigest: "9b8f4f33b7b15f687ae5dc8fd5f94c3b88f4f3e6e9a81d9f2a1f98a1a970c4e2",
  schemaVersion: "service-request.v1",
};

const disclosureFields = [
  {
    path: "service.category",
    label: "Service category",
    purpose: "Route your request to the relevant public information.",
    dataClass: "public",
    required: true,
  },
  {
    path: "request.summary",
    label: "Request summary",
    purpose: "Give the partner enough context to find relevant guidance.",
    dataClass: "personal",
    required: false,
  },
  {
    path: "contact.email",
    label: "Email address",
    purpose: "Not needed for this information lookup.",
    dataClass: "personal",
    required: false,
  },
  {
    path: "health.diagnosis",
    label: "Health information",
    purpose: "Not needed for this service discovery request.",
    dataClass: "sensitive",
    required: false,
  },
];

const state = {
  request: null,
  receipt: null,
  receiptJson: "",
  decisions: new Map(),
};

const el = (id) => document.getElementById(id);

const statusLog = (message, error) => { const target = el("consent-note"); if (target) target.textContent = error ? `${message} ${String(error.message || error)}` : message; };

function toast(message) {
  const item = el("toast");
  item.textContent = message;
  item.classList.add("visible");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => item.classList.remove("visible"), 2600);
}

function updateSummaryCount() {
  const length = el("request-summary").value.length;
  el("summary-count").textContent = `${length} / 240`;
}

function buildSourcePayload() {
  return {
    service: {
      category: el("service-category").value,
    },
    request: {
      summary: el("request-summary").value.trim(),
    },
    contact: {
      email: "demo.person@example.test",
    },
    health: {
      diagnosis: "synthetic-only-value",
    },
  };
}

function renderDisclosure() {
  const list = el("disclosure-list");
  list.replaceChildren();

  for (const field of disclosureFields) {
    const row = document.createElement("div");
    row.className = "disclosure-row";

    const description = document.createElement("div");
    const label = document.createElement("b");
    label.textContent = field.label;
    const reason = document.createElement("small");
    reason.textContent = field.purpose;
    const classification = document.createElement("span");
    classification.className = `data-class ${field.dataClass === "sensitive" ? "sensitive" : ""}`;
    classification.textContent = `${field.dataClass} data · ${field.required ? "required" : "optional"}`;
    description.append(label, reason, classification);

    const switchLabel = document.createElement("label");
    switchLabel.className = "switch";
    switchLabel.setAttribute("aria-label", `Share ${field.label}`);
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = state.decisions.get(field.path) === true;
    input.disabled = field.required;
    input.addEventListener("change", () => {
      state.decisions.set(field.path, input.checked);
      updateShareCount();
    });
    const track = document.createElement("span");
    track.className = "switch-track";
    switchLabel.append(input, track);
    row.append(description, switchLabel);
    list.append(row);
  }

  updateShareCount();
}

function updateShareCount() {
  const approvedCount = disclosureFields.filter((field) => state.decisions.get(field.path) === true).length;
  el("share-count").textContent = `${approvedCount} of ${disclosureFields.length}`;
}

async function prepareRequest() {
  const summary = el("request-summary").value.trim();
  if (!summary) {
    toast("Add a short request summary first.");
    el("request-summary").focus();
    return;
  }

  statusLog("Preparing a local request...");
  const payload = buildSourcePayload();
  // A sensitive value and a contact detail are deliberately in the local test
  // context to prove that the projection code does not forward them by default.
  state.request = await preparePeerRequest({
    peerNetworkUrl: PEER.url,
    purpose: "Find relevant public service guidance for the selected category.",
    agentName: PEER.agentName,
    capabilityName: PEER.capabilityName,
    effect: "read",
    payload,
    fields: disclosureFields,
    manifestDigest: PEER.manifestDigest,
    schemaVersion: PEER.schemaVersion,
  });

  state.decisions = new Map(disclosureFields.map((field) => [field.path, field.required]));
  renderDisclosure();
  statusLog("Request prepared in this browser only. No partner was contacted.");
  el("review-status").textContent = "READY TO REVIEW";
  el("review-status").className = "status-pill prepared";
  el("approve-handoff").disabled = false;
  el("reject-handoff").disabled = false;
  el("consent-note").textContent = "Synthetic data only. Preparing this request has not contacted the partner.";
  toast("Request prepared locally. Review each field before approval.");
}

function renderReceipt(receipt) {
  const card = el("receipt-card");
  card.replaceChildren();
  const wrapper = document.createElement("div");
  wrapper.className = "receipt-content";

  const top = document.createElement("div");
  top.className = "receipt-top";
  const details = document.createElement("div");
  const title = document.createElement("b");
  title.textContent = "Service handoff decision";
  const subtitle = document.createElement("small");
  subtitle.textContent = `${receipt.peerOrigin} · ${receipt.purpose}`;
  details.append(title, subtitle);
  const outcome = document.createElement("span");
  outcome.className = `receipt-outcome ${receipt.decision === "rejected" ? "denied" : ""}`;
  outcome.textContent = receipt.decision === "approved" ? "APPROVED · LOCAL DEMO" : "REJECTED · NOTHING SENT";
  top.append(details, outcome);

  const fields = document.createElement("div");
  fields.className = "receipt-fields";
  for (const field of receipt.fields) {
    const line = document.createElement("div");
    line.className = "receipt-field";
    const dot = document.createElement("span");
    dot.textContent = field.disposition === "shared" ? "✓" : "—";
    const name = document.createElement("span");
    name.textContent = field.label;
    const status = document.createElement("strong");
    status.className = field.disposition;
    status.textContent = field.disposition.toUpperCase();
    line.append(dot, name, status);
    fields.append(line);
  }

  const meta = document.createElement("div");
  meta.className = "receipt-meta";
  const id = document.createElement("span");
  id.textContent = `Request: ${receipt.requestId.slice(0, 16)}…`;
  const manifest = document.createElement("span");
  manifest.textContent = `Manifest: ${receipt.manifestDigest.slice(0, 14)}…`;
  const digest = document.createElement("span");
  digest.textContent = `Receipt SHA-256: ${receipt.receiptDigest.slice(0, 18)}…`;
  meta.append(id, manifest, digest);

  wrapper.append(top, fields, meta);
  card.append(wrapper);
}

async function recordDecision(approved) {
  if (!state.request) {
    toast("Prepare a request first.");
    return;
  }

  const decisions = disclosureFields.map((field) => ({
    path: field.path,
    share: state.decisions.get(field.path) === true,
  }));

  // The receipt is built from the exact decision contract. No raw field values
  // or external calls leave this browser in the MVP preview.
  const result = await approvePeerRequest(state.request, decisions);
  const receipt = await createDisclosureReceipt({
    decision: result.decision,
    fields: disclosureFields,
    purpose: state.request.purpose,
    approved,
  });
  const valid = await verifyDisclosureReceipt(receipt);
  if (!valid) throw new Error("Receipt integrity check failed.");

  state.receipt = receipt;
  state.receiptJson = JSON.stringify(receipt, null, 2);
  renderReceipt(receipt);

  el("review-status").textContent = approved ? "APPROVED" : "REJECTED";
  el("review-status").className = `status-pill ${approved ? "approved" : "rejected"}`;
  el("approve-handoff").disabled = true;
  el("reject-handoff").disabled = true;
  el("download-receipt").disabled = false;

  if (approved) {
    el("consent-note").textContent = "Approval recorded for this exact request. This preview has not contacted the partner.";
    toast("Approval and receipt recorded locally. No network request was sent.");
  } else {
    el("consent-note").textContent = "You declined. No request was sent and no partner was contacted.";
    toast("Handoff rejected. Nothing was sent.");
  }
}

function downloadReceipt() {
  if (!state.receiptJson) return;
  const blob = new Blob([state.receiptJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `trustmesh-receipt-${state.receipt.requestId.slice(0, 10)}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

el("request-summary").addEventListener("input", updateSummaryCount);
el("prepare-request").addEventListener("click", async () => {
  try {
    await prepareRequest();
  } catch (error) {
    statusLog("Request preparation failed:", error);
    console.error(error);
    toast(error instanceof Error ? error.message : "Could not prepare the request.");
  }
});
el("approve-handoff").addEventListener("click", () => void recordDecision(true).catch((error) => {
  console.error(error);
  toast(error instanceof Error ? error.message : "Could not record approval.");
}));
el("reject-handoff").addEventListener("click", () => void recordDecision(false).catch((error) => {
  console.error(error);
  toast(error instanceof Error ? error.message : "Could not record rejection.");
}));
el("download-receipt").addEventListener("click", downloadReceipt);
updateSummaryCount();


// Cross-site peer receipts are emitted by site-runtime.ts after the visitor
// approves or rejects the exact structured payload. Raw field values are never
// stored in this view or in the exported receipt.
const peerReceipts = new Map();

function renderPeerReceipts() {
  const container = el("peer-receipt-list");
  if (!container) return;
  container.replaceChildren();

  if (!peerReceipts.size) {
    const empty = document.createElement("p");
    empty.className = "peer-receipts-empty";
    empty.textContent = "No cross-site handoff has been approved in this session.";
    container.append(empty);
    return;
  }

  for (const entry of [...peerReceipts.values()].reverse()) {
    const receipt = entry.receipt;
    const card = document.createElement("article");
    card.className = "peer-receipt-card";

    const heading = document.createElement("div");
    heading.className = "peer-receipt-heading";
    const title = document.createElement("strong");
    title.textContent = String(receipt.peerLabel || "Independent peer");
    const status = document.createElement("span");
    status.className = `peer-receipt-status ${entry.outcome || receipt.decision}`;
    status.textContent = String(entry.outcome || receipt.decision || "recorded").toUpperCase();
    heading.append(title, status);

    const origin = document.createElement("p");
    origin.className = "peer-receipt-origin";
    origin.textContent = `${receipt.peerOrigin || ""} · ${receipt.networkName || ""}`;

    const fields = document.createElement("div");
    fields.className = "peer-receipt-fields";
    for (const field of receipt.fields || []) {
      const item = document.createElement("span");
      item.className = field.disposition === "shared" ? "shared" : "withheld";
      item.textContent = `${field.label}: ${field.disposition}`;
      fields.append(item);
    }

    const digest = document.createElement("p");
    digest.className = "peer-receipt-digest";
    digest.textContent = `Payload SHA-256: ${String(receipt.payloadDigest || "").slice(0, 24)}… · Receipt SHA-256: ${String(receipt.receiptDigest || "").slice(0, 24)}…`;

    const evidence = document.createElement("p");
    evidence.className = "peer-receipt-digest";
    if (entry.responseDigest) {
      evidence.textContent = `Peer response SHA-256: ${entry.responseDigest.slice(0, 24)}…`;
    } else if (entry.outcome === "unknown") {
      evidence.textContent = "The peer response could not be verified. Do not assume the task completed.";
    } else {
      evidence.textContent = "No raw request values or private context are stored in this receipt.";
    }

    const download = document.createElement("button");
    download.className = "button button-quiet peer-receipt-download";
    download.textContent = "Export receipt JSON";
    download.addEventListener("click", () => {
      const exportData = {
        disclosureReceipt: receipt,
        peerResult: {
          outcome: entry.outcome || "awaiting",
          responseDigest: entry.responseDigest || null,
          recordedAt: entry.resultRecordedAt || null,
          note: "The disclosure receipt digest covers the consent record. The peer-result digest is separate evidence and does not prove the publisher's identity."
        }
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `trustmesh-peer-receipt-${String(receipt.receiptId || "record").slice(0, 10)}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    });

    card.append(heading, origin, fields, digest, evidence, download);
    container.append(card);
  }
}

window.addEventListener("trustmesh:peer-consent", (event) => {
  const receipt = event.detail;
  if (!receipt || typeof receipt.receiptId !== "string") return;
  peerReceipts.set(receipt.receiptId, {
    receipt,
    outcome: receipt.decision,
    responseDigest: null,
    resultRecordedAt: null
  });
  renderPeerReceipts();
});

window.addEventListener("trustmesh:peer-result", (event) => {
  const detail = event.detail;
  if (!detail || typeof detail.receiptId !== "string") return;
  const entry = peerReceipts.get(detail.receiptId);
  if (!entry) return;
  entry.outcome = String(detail.outcome || "unknown");
  entry.responseDigest = typeof detail.responseDigest === "string" ? detail.responseDigest : null;
  entry.resultRecordedAt = new Date().toISOString();
  renderPeerReceipts();
});

renderPeerReceipts();
