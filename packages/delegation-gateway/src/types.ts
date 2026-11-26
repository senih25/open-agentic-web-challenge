export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type DataClass = "public" | "personal" | "sensitive";

export interface DisclosureField {
  /** Dotted path from the top-level request object, e.g. "case.reference". */
  path: string;
  label: string;
  purpose: string;
  dataClass: DataClass;
  required: boolean;
}

export interface PeerRequest {
  requestId: string;
  peerNetworkUrl: string;
  purpose: string;
  agentName: string;
  capabilityName: string;
  effect: "read" | "write" | "irreversible";
  payload: Record<string, JsonValue>;
  fields: DisclosureField[];
  manifestDigest: string;
  schemaVersion: string;
  createdAt: string;
}

export interface FieldDecision {
  path: string;
  share: boolean;
}

export interface ConsentDecision {
  requestId: string;
  peerOrigin: string;
  peerNetworkUrl: string;
  manifestDigest: string;
  agentName: string;
  capabilityName: string;
  payloadDigest: string;
  schemaVersion: string;
  effect: PeerRequest["effect"];
  decisions: FieldDecision[];
  approvedAt: string;
  expiresAt: string;
  nonce: string;
}

export interface DisclosureReceipt {
  version: 1;
  requestId: string;
  peerOrigin: string;
  peerNetworkUrl: string;
  manifestDigest: string;
  agentName: string;
  capabilityName: string;
  payloadDigest: string;
  schemaVersion: string;
  purpose: string;
  effect: PeerRequest["effect"];
  fields: Array<{
    path: string;
    label: string;
    dataClass: DataClass;
    disposition: "shared" | "withheld";
  }>;
  decision: "approved" | "rejected";
  timestamp: string;
  expiresAt: string | null;
  receiptDigest: string;
}
