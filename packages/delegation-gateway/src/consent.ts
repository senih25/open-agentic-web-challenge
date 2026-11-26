import { canonicalJson, sha256Hex } from "./canonical.js";
import { projectPayload } from "./payload-projection.js";
import type {
  ConsentDecision,
  DisclosureField,
  FieldDecision,
  JsonValue,
  PeerRequest,
} from "./types.js";

export interface ConsentPolicy {
  ttlMs: number;
  maxPayloadBytes: number;
  requireEveryFieldDecision: boolean;
}

export const DEFAULT_CONSENT_POLICY: ConsentPolicy = {
  ttlMs: 5 * 60 * 1000,
  maxPayloadBytes: 8 * 1024,
  requireEveryFieldDecision: true,
};

function validateHttpsPeerUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    throw new Error("Peer networks must use HTTPS outside local development.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("Peer network URL must not contain credentials, query strings or fragments.");
  }
  if (url.pathname.split("/").filter(Boolean).length < 1) {
    throw new Error("Peer network URL must end with a published network name.");
  }
  return url;
}

function assertFieldContract(fields: DisclosureField[]): void {
  const seen = new Set<string>();
  for (const field of fields) {
    if (!field.path || field.path.split(".").some((part) => !part)) {
      throw new Error("Disclosure field paths must be valid dotted paths.");
    }
    if (seen.has(field.path)) throw new Error(`Duplicate disclosure field: ${field.path}`);
    seen.add(field.path);
    if (!field.purpose.trim() || !field.label.trim()) {
      throw new Error(`Field ${field.path} requires a label and purpose.`);
    }
  }
}

export async function preparePeerRequest(
  input: Omit<PeerRequest, "requestId" | "createdAt">,
  policy: ConsentPolicy = DEFAULT_CONSENT_POLICY,
): Promise<PeerRequest> {
  const url = validateHttpsPeerUrl(input.peerNetworkUrl);
  assertFieldContract(input.fields);
  if (!input.purpose.trim()) throw new Error("A specific peer-contact purpose is required.");
  if (!input.agentName.trim() || !input.capabilityName.trim()) {
    throw new Error("Agent and capability names are required.");
  }
  const payloadText = canonicalJson(input.payload as JsonValue);
  const payloadBytes = new TextEncoder().encode(payloadText).byteLength;
  if (payloadBytes > policy.maxPayloadBytes) {
    throw new Error("Peer request exceeds the configured payload size limit.");
  }
  const createdAt = new Date().toISOString();
  const seed = [
    url.origin,
    input.peerNetworkUrl,
    input.manifestDigest,
    input.agentName,
    input.capabilityName,
    payloadText,
    createdAt,
    crypto.randomUUID(),
  ].join("|");
  const requestId = await sha256Hex(seed);
  return { ...input, requestId, createdAt, peerNetworkUrl: url.href.replace(/\/$/, "") };
}

export async function approvePeerRequest(
  request: PeerRequest,
  decisions: FieldDecision[],
  policy: ConsentPolicy = DEFAULT_CONSENT_POLICY,
): Promise<{ decision: ConsentDecision; payload: Record<string, JsonValue> }> {
  const decisionPaths = new Set(decisions.map((item) => item.path));
  if (policy.requireEveryFieldDecision && decisionPaths.size !== request.fields.length) {
    throw new Error("Every disclosure field must receive an explicit share/withhold decision.");
  }
  for (const field of request.fields) {
    if (field.required && decisions.find((item) => item.path === field.path)?.share !== true) {
      throw new Error(`Required field must be explicitly shared: ${field.label}`);
    }
  }

  const projected = projectPayload(request.payload, request.fields, decisions);
  const payloadDigest = await sha256Hex(canonicalJson(projected.payload as JsonValue));
  const url = validateHttpsPeerUrl(request.peerNetworkUrl);
  const approvedAt = new Date();
  const nonce = crypto.randomUUID();

  const decision: ConsentDecision = {
    requestId: request.requestId,
    peerOrigin: url.origin,
    peerNetworkUrl: request.peerNetworkUrl,
    manifestDigest: request.manifestDigest,
    agentName: request.agentName,
    capabilityName: request.capabilityName,
    payloadDigest,
    schemaVersion: request.schemaVersion,
    effect: request.effect,
    decisions: request.fields.map((field) => ({
      path: field.path,
      share: decisionPaths.has(field.path) && decisions.find((item) => item.path === field.path)?.share === true,
    })),
    approvedAt: approvedAt.toISOString(),
    expiresAt: new Date(approvedAt.getTime() + policy.ttlMs).toISOString(),
    nonce,
  };
  return { decision, payload: projected.payload };
}

/** Recheck the complete binding immediately before a peer capability is invoked. */
export async function assertConsentMatches(
  decision: ConsentDecision,
  current: PeerRequest,
  actualPayload: Record<string, JsonValue>,
  now = new Date(),
): Promise<void> {
  const url = validateHttpsPeerUrl(current.peerNetworkUrl);
  const actualDigest = await sha256Hex(canonicalJson(actualPayload as JsonValue));
  if (now.getTime() > Date.parse(decision.expiresAt)) {
    throw new Error("Consent has expired. Ask the user again.");
  }
  const matches =
    decision.requestId === current.requestId &&
    decision.peerOrigin === url.origin &&
    decision.peerNetworkUrl === current.peerNetworkUrl &&
    decision.manifestDigest === current.manifestDigest &&
    decision.agentName === current.agentName &&
    decision.capabilityName === current.capabilityName &&
    decision.schemaVersion === current.schemaVersion &&
    decision.effect === current.effect &&
    decision.payloadDigest === actualDigest;
  if (!matches) throw new Error("Consent does not match the exact peer request. Nothing was sent.");
}

/** One-use consent store. A second claim is rejected, including concurrent claims. */
export class OneUseConsentStore {
  private readonly used = new Set<string>();

  claim(decision: ConsentDecision, now = new Date()): void {
    if (now.getTime() > Date.parse(decision.expiresAt)) {
      throw new Error("Consent has expired. Ask the user again.");
    }
    if (this.used.has(decision.nonce)) {
      throw new Error("This approval has already been used. Ask the user again.");
    }
    this.used.add(decision.nonce);
  }
}
