import { canonicalJson, sha256Hex } from "./canonical.js";
import type { ConsentDecision, DisclosureField, DisclosureReceipt } from "./types.js";

export async function createDisclosureReceipt(input: {
  decision: ConsentDecision;
  fields: DisclosureField[];
  purpose: string;
  approved: boolean;
}): Promise<DisclosureReceipt> {
  const created = {
    version: 1 as const,
    requestId: input.decision.requestId,
    peerOrigin: input.decision.peerOrigin,
    peerNetworkUrl: input.decision.peerNetworkUrl,
    manifestDigest: input.decision.manifestDigest,
    agentName: input.decision.agentName,
    capabilityName: input.decision.capabilityName,
    payloadDigest: input.decision.payloadDigest,
    schemaVersion: input.decision.schemaVersion,
    purpose: input.purpose,
    effect: input.decision.effect,
    fields: input.fields.map((field) => ({
      path: field.path,
      label: field.label,
      dataClass: field.dataClass,
      disposition: input.decision.decisions.find((item) => item.path === field.path)?.share
        ? "shared" as const
        : "withheld" as const,
    })),
    decision: input.approved ? "approved" as const : "rejected" as const,
    timestamp: input.decision.approvedAt,
    expiresAt: input.approved ? input.decision.expiresAt : null,
  };
  const receiptDigest = await sha256Hex(canonicalJson(created as never));
  return { ...created, receiptDigest };
}

export async function verifyDisclosureReceipt(receipt: DisclosureReceipt): Promise<boolean> {
  const { receiptDigest, ...unsigned } = receipt;
  return (await sha256Hex(canonicalJson(unsigned as never))) === receiptDigest;
}
