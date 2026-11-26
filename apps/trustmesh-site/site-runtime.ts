import {
  canonicalJson,
  projectPayload,
  sha256Hex,
} from "../../packages/delegation-gateway/src/index.ts";
import type {
  DataClass,
  DisclosureField,
  JsonValue,
} from "../../packages/delegation-gateway/src/index.ts";

type PeerConsentInfo = {
  kind?: string;
  peerLabel?: string;
  peerOrigin?: string;
  peerNetworkUrl?: string;
  networkName?: string;
  purpose?: string;
  requestText?: string;
  manifestDigest?: string;
  networkDigest?: string;
};

type RuntimeConsentDecision =
  | string
  | {
      decision: "allow" | "decline";
      requestText?: string;
      receiptId?: string;
      payloadDigest?: string;
      sharedPaths?: string[];
      withheldPaths?: string[];
    };

const MAX_REQUEST_BYTES = 8 * 1024;

function isRecord(value: unknown): value is Record<string, JsonValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function classifyField(path: string): DataClass {
  if (/(health|medical|diagnos|disability|condition|medication|national.?id|passport|tax.?id)/i.test(path)) {
    return "sensitive";
  }
  if (/(email|phone|mobile|name|address|postcode|postal|birth|dob|date.?of.?birth|account|reference.?number)/i.test(path)) {
    return "personal";
  }
  return "public";
}

function makeDisclosureFields(payload: Record<string, JsonValue>): DisclosureField[] {
  const fields: DisclosureField[] = [];
  const walk = (value: JsonValue, prefix: string) => {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const entries = Object.entries(value);
      if (!entries.length) {
        fields.push({
          path: prefix,
          label: prefix.replace(/[._-]+/g, " "),
          purpose: "Optional structured context for this partner task.",
          dataClass: classifyField(prefix),
          required: prefix === "service_category",
        });
        return;
      }
      for (const [key, child] of entries) {
        if (!key || ["__proto__", "prototype", "constructor"].includes(key) || key.includes(".")) {
          throw new Error("The peer request contains an unsafe or ambiguous field name.");
        }
        walk(child, prefix ? `${prefix}.${key}` : key);
      }
      return;
    }

    fields.push({
      path: prefix,
      label: prefix.replace(/[._-]+/g, " "),
      purpose: "This value may help the partner answer the specific request. Share only when needed.",
      dataClass: classifyField(prefix),
      required: prefix === "service_category",
    });
  };

  walk(payload, "");
  return fields;
}

function safeValuePreview(value: JsonValue): string {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return serialized.length > 500 ? `${serialized.slice(0, 500)}…` : serialized;
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function createReceipt(input: {
  info: PeerConsentInfo;
  decision: "approved" | "declined";
  fields: DisclosureField[];
  sharedPaths: string[];
  withheldPaths: string[];
  payloadDigest: string;
}): Promise<Record<string, unknown>> {
  const body = {
    version: 1,
    receiptId: crypto.randomUUID(),
    kind: "peer-disclosure",
    decision: input.decision,
    peerLabel: input.info.peerLabel || input.info.networkName || "Independent agentic website",
    peerOrigin: input.info.peerOrigin || "",
    peerNetworkUrl: input.info.peerNetworkUrl || "",
    networkName: input.info.networkName || "",
    purpose: input.info.purpose || "Run a bounded task with an independent peer agent.",
    manifestDigest: input.info.manifestDigest || "",
    networkDigest: input.info.networkDigest || "",
    payloadDigest: input.payloadDigest,
    fields: input.fields.map((field) => ({
      path: field.path,
      label: field.label,
      dataClass: field.dataClass,
      disposition: input.sharedPaths.includes(field.path) ? "shared" : "withheld",
    })),
    sharedPaths: input.sharedPaths,
    withheldPaths: input.withheldPaths,
    timestamp: new Date().toISOString(),
    privacyNote: "Contains field names and digests only. Raw request values are not stored in this receipt.",
  };
  const receiptDigest = await sha256Hex(canonicalJson(body as JsonValue));
  return { ...body, receiptDigest };
}

function showReceipt(receipt: Record<string, unknown>): void {
  window.dispatchEvent(new CustomEvent("trustmesh:peer-consent", { detail: receipt }));
}

function openDisclosureDialog(info: PeerConsentInfo): Promise<RuntimeConsentDecision> {
  return new Promise((resolve) => {
    let payload: Record<string, JsonValue>;
    let fields: DisclosureField[];
    try {
      if (!info.requestText || new TextEncoder().encode(info.requestText).byteLength > MAX_REQUEST_BYTES) {
        throw new Error("The peer request is empty or exceeds the 8 KB review limit.");
      }
      const parsed: unknown = JSON.parse(info.requestText);
      if (!isRecord(parsed)) {
        throw new Error("The partner request must be a JSON object so its fields can be reviewed separately.");
      }
      payload = parsed;
      fields = makeDisclosureFields(payload);
      if (!fields.length) throw new Error("The partner request contains no reviewable fields.");
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Invalid structured request.";
      const failure = element("dialog", "tm-peer-consent");
      const title = element("h2", "", "This request cannot be shared safely");
      const message = element("p", "", reason);
      const detail = element("p", "tm-consent-note", "No user request details have been sent to the partner.");
      const close = element("button", "tm-consent-secondary", "Close");
      close.addEventListener("click", () => failure.close("decline"));
      failure.addEventListener("close", () => {
        failure.remove();
        resolve({ decision: "decline" });
      }, { once: true });
      failure.append(title, message, detail, close);
      document.body.append(failure);
      failure.showModal();
      return;
    }

    const dialog = element("dialog", "tm-peer-consent");
    const heading = element("h2", "", "Review the exact data sent to this site");
    const origin = element("p", "tm-consent-origin", `${info.peerLabel || "Partner agent"} · ${info.peerOrigin || "Unknown origin"}`);
    const purpose = element("p", "tm-consent-purpose", info.purpose || "The partner will use only the fields you approve to answer this task.");
    const hashes = element(
      "p",
      "tm-consent-hashes",
      `Manifest SHA-256: ${(info.manifestDigest || "").slice(0, 20)}… · Network SHA-256: ${(info.networkDigest || "").slice(0, 20)}…`,
    );
    const note = element("p", "tm-consent-note", "The public network has already been fetched and validated. Your request is not sent until you approve the selected fields.");
    const list = element("div", "tm-disclosure-fields");
    const decisions = new Map<string, boolean>(
      fields.map((field) => [field.path, field.required]),
    );

    for (const field of fields) {
      const row = element("label", "tm-disclosure-field");
      const details = element("span", "tm-disclosure-detail");
      const fieldTitle = element("strong", "tm-disclosure-title", field.label);
      const metadata = element("small", "tm-disclosure-meta", `${field.dataClass.toUpperCase()} · ${field.required ? "Required for this network" : "Optional"}`);
      const fieldValue = field.path.split(".").reduce<JsonValue | undefined>((current, part) => {
        if (current === null || Array.isArray(current) || typeof current !== "object") return undefined;
        return (current as Record<string, JsonValue>)[part];
      }, payload);
      const preview = element("code", "tm-disclosure-value", safeValuePreview(fieldValue ?? null));
      details.append(fieldTitle, metadata, preview);
      const checkbox = element("input");
      checkbox.type = "checkbox";
      checkbox.checked = field.required;
      checkbox.disabled = field.required;
      checkbox.addEventListener("change", () => {
        decisions.set(field.path, checkbox.checked);
        updateCount();
      });
      row.append(details, checkbox);
      list.append(row);
    }

    const count = element("p", "tm-consent-count");
    const updateCount = () => {
      const selected = fields.filter((field) => decisions.get(field.path) === true).length;
      count.textContent = `${selected} of ${fields.length} fields selected`;
    };
    updateCount();

    const actions = element("div", "tm-consent-actions");
    const decline = element("button", "tm-consent-secondary", "Decline this handoff");
    const approve = element("button", "tm-consent-primary", "Send approved fields");
    decline.addEventListener("click", () => dialog.close("decline"));
    approve.addEventListener("click", () => dialog.close("approve"));

    dialog.addEventListener("close", () => {
      dialog.remove();
      void (async () => {
        const selected = fields.map((field) => ({
          path: field.path,
          share: decisions.get(field.path) === true,
        }));
        if (dialog.returnValue !== "approve") {
          const receipt = await createReceipt({
            info,
            decision: "declined",
            fields,
            sharedPaths: [],
            withheldPaths: fields.map((field) => field.path),
            payloadDigest: await sha256Hex(""),
          });
          showReceipt(receipt);
          resolve({ decision: "decline" });
          return;
        }

        try {
          const projected = projectPayload(payload, fields, selected);
          if (!projected.sharedPaths.length) {
            throw new Error("Select at least one field before sending the request.");
          }
          const requestText = canonicalJson(projected.payload);
          const payloadDigest = await sha256Hex(requestText);
          const receipt = await createReceipt({
            info,
            decision: "approved",
            fields,
            sharedPaths: projected.sharedPaths,
            withheldPaths: projected.withheldPaths,
            payloadDigest,
          });
          showReceipt(receipt);
          resolve({
            decision: "allow",
            requestText,
            receiptId: String(receipt.receiptId),
            payloadDigest,
            sharedPaths: projected.sharedPaths,
            withheldPaths: projected.withheldPaths,
          });
        } catch (error) {
          const reason = error instanceof Error ? error.message : "The selected fields could not be shared safely.";
          const failed = await createReceipt({
            info,
            decision: "declined",
            fields,
            sharedPaths: [],
            withheldPaths: fields.map((field) => field.path),
            payloadDigest: await sha256Hex(""),
          });
          showReceipt({ ...failed, reason });
          resolve({ decision: "decline" });
        }
      })();
    }, { once: true });

    actions.append(decline, approve);
    dialog.append(heading, origin, purpose, hashes, note, list, count, actions);
    document.body.append(dialog);
    dialog.showModal();
  });
}

async function startTrustMeshRuntime(): Promise<void> {
  const status = document.getElementById("assistant-status");
  try {
    const runtimeUrl = new URL("/runtime/index.js", window.location.origin).href;
    const { boot } = await import(/* @vite-ignore */ runtimeUrl);
    const booted = await boot("#agent-app", {
      originUrl: new URL("/", window.location.href).href,
      sandboxWorkerUrl: new URL("/runtime/sandbox-worker.js", window.location.origin).href,
    });
    const engine = booted.engine;
    const defaultConsent = typeof engine.onConsent === "function"
      ? engine.onConsent.bind(engine)
      : async () => "decline";
    engine.onConsent = async (info: PeerConsentInfo): Promise<RuntimeConsentDecision> => {
      if (info.kind === "network-data") return openDisclosureDialog(info);
      const decision = await defaultConsent(info);
      // Do not let a remembered origin-level "Always allow" choice bypass the
      // second, per-request data disclosure review.
      if (info.kind === "network-discovery" && decision === "always") return "allow";
      return decision;
    };
    (window as Window & { __trustmeshEngine?: unknown }).__trustmeshEngine = engine;
    if (status) {
      status.textContent = engine.mockLLM
        ? "The demo model is ready."
        : "Choose your AI provider and add your key in the settings panel. Peer data sharing is reviewed separately.";
    }
  } catch (error) {
    if (status) status.textContent = "The assistant could not load. The public service directory remains available below.";
    console.error("TrustMesh runtime startup failed", error);
  }
}

void startTrustMeshRuntime();
