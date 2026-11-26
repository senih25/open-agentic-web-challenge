import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_CONSENT_POLICY,
  OneUseConsentStore,
  approvePeerRequest,
  assertConsentMatches,
  createDisclosureReceipt,
  preparePeerRequest,
  projectPayload,
  verifyDisclosureReceipt,
} from "../src/index.js";
import type { DisclosureField, PeerRequest } from "../src/index.js";

const fields: DisclosureField[] = [
  { path: "service.category", label: "Service category", purpose: "Route to the right public service", dataClass: "public", required: true },
  { path: "contact.email", label: "Email address", purpose: "Only if the service must send a reply", dataClass: "personal", required: false },
  { path: "health.diagnosis", label: "Diagnosis", purpose: "Not needed for service discovery", dataClass: "sensitive", required: false },
];

async function makeRequest(): Promise<PeerRequest> {
  return preparePeerRequest({
    peerNetworkUrl: "https://partner.example/benefits_guide",
    purpose: "Find the appropriate public information service",
    agentName: "benefits_guide",
    capabilityName: "find_public_guidance",
    effect: "read",
    manifestDigest: "a".repeat(64),
    schemaVersion: "request.v1",
    payload: {
      service: { category: "housing" },
      contact: { email: "person@example.test" },
      health: { diagnosis: "must-not-leak" },
      injected: { hidden: "must-not-leak" },
    },
    fields,
  });
}

describe("TrustMesh consent-bound delegation", () => {
  it("projects only explicitly shared fields and withholds all other data", () => {
    const result = projectPayload(
      {
        service: { category: "housing", internalNote: "private" },
        contact: { email: "private@example.test" },
        health: { diagnosis: "secret" },
        hidden: "not declared",
      },
      fields,
      [
        { path: "service.category", share: true },
        { path: "contact.email", share: false },
        { path: "health.diagnosis", share: false },
      ],
    );
    expect(result.payload).toEqual({ service: { category: "housing" } });
    expect(result.sharedPaths).toEqual(["service.category"]);
    expect(result.withheldPaths).toEqual(["contact.email", "health.diagnosis"]);
  });

  it("requires an explicit decision for every declared field", async () => {
    const request = await makeRequest();
    await expect(approvePeerRequest(request, [
      { path: "service.category", share: true },
    ])).rejects.toThrow("Every disclosure field must receive");
  });

  it("does not allow a required field to be withheld", async () => {
    const request = await makeRequest();
    await expect(approvePeerRequest(request, fields.map((field) => ({
      path: field.path,
      share: field.path !== "service.category",
    })))).rejects.toThrow("Required field must be explicitly shared");
  });

  it("binds approval to the exact payload, capability, origin and manifest", async () => {
    const request = await makeRequest();
    const decisions = fields.map((field) => ({ path: field.path, share: field.path === "service.category" }));
    const approved = await approvePeerRequest(request, decisions);
    await expect(assertConsentMatches(approved.decision, request, approved.payload)).resolves.toBeUndefined();

    const altered = { ...approved.payload, unexpected: "exfiltration" };
    await expect(assertConsentMatches(approved.decision, request, altered)).rejects.toThrow("does not match");
  });

  it("rejects HTTP peer networks except explicit loopback local development", async () => {
    await expect(preparePeerRequest({
      peerNetworkUrl: "http://partner.example/network",
      purpose: "test",
      agentName: "agent",
      capabilityName: "lookup",
      effect: "read",
      manifestDigest: "a".repeat(64),
      schemaVersion: "v1",
      payload: {},
      fields: [],
    })).rejects.toThrow("HTTPS");
  });

  it("rejects URL credentials and query strings", async () => {
    await expect(preparePeerRequest({
      peerNetworkUrl: "https://user:pass@partner.example/network",
      purpose: "test",
      agentName: "agent",
      capabilityName: "lookup",
      effect: "read",
      manifestDigest: "a".repeat(64),
      schemaVersion: "v1",
      payload: {},
      fields: [],
    })).rejects.toThrow("credentials");
  });

  it("rejects unsafe prototype keys", () => {
    const malicious = JSON.parse('{"service":{"category":"housing"},"__proto__":{"isAdmin":true}}');
    expect(() => projectPayload(malicious, fields, [
      { path: "service.category", share: true },
      { path: "contact.email", share: false },
      { path: "health.diagnosis", share: false },
    ])).toThrow("Unsafe property name");
  });

  it("requires nonce to be single-use", async () => {
    const request = await makeRequest();
    const approved = await approvePeerRequest(request, fields.map((field) => ({
      path: field.path,
      share: field.path === "service.category",
    })));
    const store = new OneUseConsentStore();
    store.claim(approved.decision);
    expect(() => store.claim(approved.decision)).toThrow("already been used");
  });

  it("produces a receipt with dispositions but no raw field values", async () => {
    const request = await makeRequest();
    const approved = await approvePeerRequest(request, fields.map((field) => ({
      path: field.path,
      share: field.path === "service.category",
    })));
    const receipt = await createDisclosureReceipt({
      decision: approved.decision,
      fields,
      purpose: request.purpose,
      approved: true,
    });
    expect(await verifyDisclosureReceipt(receipt)).toBe(true);
    const serialized = JSON.stringify(receipt);
    expect(serialized).not.toContain("person@example.test");
    expect(serialized).not.toContain("must-not-leak");
    expect(receipt.fields.find((field) => field.path === "health.diagnosis")?.disposition).toBe("withheld");
  });

  it("detects receipt tampering", async () => {
    const request = await makeRequest();
    const approved = await approvePeerRequest(request, fields.map((field) => ({
      path: field.path,
      share: field.path === "service.category",
    })));
    const receipt = await createDisclosureReceipt({
      decision: approved.decision,
      fields,
      purpose: request.purpose,
      approved: true,
    });
    const tampered = { ...receipt, purpose: "different purpose" };
    expect(await verifyDisclosureReceipt(tampered)).toBe(false);
  });

  it("honors a bounded payload size", async () => {
    const request = await makeRequest();
    const huge = { ...request, payload: { data: "x".repeat(10_000) } };
    await expect(preparePeerRequest({
      peerNetworkUrl: huge.peerNetworkUrl,
      purpose: huge.purpose,
      agentName: huge.agentName,
      capabilityName: huge.capabilityName,
      effect: huge.effect,
      manifestDigest: huge.manifestDigest,
      schemaVersion: huge.schemaVersion,
      payload: huge.payload,
      fields: [],
    }, { ...DEFAULT_CONSENT_POLICY, maxPayloadBytes: 100 })).rejects.toThrow("payload size");
  });
});
