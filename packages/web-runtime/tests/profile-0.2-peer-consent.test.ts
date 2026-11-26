import { describe, expect, it, vi } from "vitest";
import { dispatchToolCall } from "../runner.js";
import { Engine } from "../engine.js";
import { sha256Hex } from "../web-crypto.js";

const peerUrl = "http://localhost:4174/open_housing_guide";
const baseOrigin = "http://127.0.0.1:4173";
const requestText = '{"region":"Izmir","service_category":"housing"}';

function makePeerContext(answers: unknown[]) {
  const session = {
    brand: "Open Housing Guide",
    manifest: { brand: "Open Housing Guide", networks: [{ name: "open_housing_guide" }] },
    network: {
      name: "open_housing_guide",
      config: { tools: [{ name: "housing_guide_assistant" }] },
    },
    invoke: vi.fn(async (request: unknown) => ({
      text: "Fictional sample guidance only.",
      receivedRequest: request,
    })),
  };
  const consentCalls: Array<Record<string, unknown>> = [];
  const composition = {
    deadline: Date.now() + 60_000,
    remoteCalls: 0,
    maxRemoteCalls: 4,
    maxCallsPerPeer: 1,
    peerCalls: new Map<string, number>(),
  };
  const ctx = {
    baseOrigin,
    displayOrigin: baseOrigin,
    mock: true,
    requestConsent: vi.fn(async (info: Record<string, unknown>) => {
      consentCalls.push(info);
      return answers.shift();
    }),
    resolveRemote: vi.fn(async () => session),
    composition,
    trace: { note: vi.fn() },
    slyData: {
      private_note: "must-not-reach-partner",
      user_email: "private@example.test",
    },
    allowedActionRefs: new Set<string>(),
  };
  return { ctx, session, consentCalls, composition };
}

const entry = {
  kind: "remote",
  url: peerUrl,
  label: "Open Housing Guide",
};

describe("MVP Profile 0.2 cross-origin consent", () => {
  it("requires a separate data approval after origin approval and sends no private context", async () => {
    const payloadDigest = await sha256Hex(requestText);
    const setup = makePeerContext([
      "allow",
      {
        decision: "allow",
        requestText,
        receiptId: "receipt-01",
        payloadDigest,
        sharedPaths: ["region", "service_category"],
        withheldPaths: ["request_summary"],
      },
    ]);

    const result = await dispatchToolCall(
      setup.ctx as never,
      entry as never,
      { request: '{"service_category":"housing","region":"Izmir","request_summary":"General housing guidance"}' },
      "parent-span",
      [],
    );

    expect(setup.ctx.requestConsent).toHaveBeenCalledTimes(2);
    expect(setup.consentCalls[0]).toMatchObject({
      kind: "network-discovery",
      peerOrigin: "http://localhost:4174",
      requestText: "",
    });
    expect(setup.consentCalls[1]).toMatchObject({
      kind: "network-data",
      peerOrigin: "http://localhost:4174",
      manifestDigest: expect.any(String),
      networkDigest: expect.any(String),
    });
    expect(setup.session.invoke).toHaveBeenCalledTimes(1);
    const sent = setup.session.invoke.mock.calls[0]![0] as {
      user_message: { text: string };
      sly_data: Record<string, unknown>;
    };
    expect(sent.user_message.text).toBe(requestText);
    expect(sent.sly_data).toEqual({});
    expect(JSON.stringify(sent)).not.toContain("must-not-reach-partner");
    expect(JSON.stringify(sent)).not.toContain("private@example.test");
    expect(result).toMatchObject({ text: "Fictional sample guidance only." });
  });

  it("does not fetch a peer when the origin approval is declined", async () => {
    const setup = makePeerContext(["decline"]);
    const result = await dispatchToolCall(
      setup.ctx as never,
      entry as never,
      { request: '{"service_category":"housing"}' },
      "parent-span",
      [],
    );

    expect(setup.ctx.requestConsent).toHaveBeenCalledTimes(1);
    expect(setup.ctx.resolveRemote).not.toHaveBeenCalled();
    expect(setup.session.invoke).not.toHaveBeenCalled();
    expect(String(result)).toContain("declined to contact");
  });

  it("does not invoke a peer when the second, field-level approval is declined", async () => {
    const setup = makePeerContext(["allow", "decline"]);
    const result = await dispatchToolCall(
      setup.ctx as never,
      entry as never,
      { request: '{"service_category":"housing","region":"Izmir"}' },
      "parent-span",
      [],
    );

    expect(setup.ctx.resolveRemote).toHaveBeenCalledTimes(1);
    expect(setup.session.invoke).not.toHaveBeenCalled();
    expect(String(result)).toContain("data-sharing review was not approved");
  });

  it("rejects a changed payload digest before invoking the peer", async () => {
    const setup = makePeerContext([
      "allow",
      {
        decision: "allow",
        requestText,
        receiptId: "receipt-bad-digest",
        payloadDigest: "0".repeat(64),
        sharedPaths: ["region", "service_category"],
        withheldPaths: [],
      },
    ]);

    await expect(dispatchToolCall(
      setup.ctx as never,
      entry as never,
      { request: '{"service_category":"housing"}' },
      "parent-span",
      [],
    )).rejects.toThrow("payload digest does not match");

    expect(setup.session.invoke).not.toHaveBeenCalled();
  });

  it("rejects a payload containing fields not shown as approved", async () => {
    const extra = '{"region":"Izmir","secret":"not-approved","service_category":"housing"}';
    const setup = makePeerContext([
      "allow",
      {
        decision: "allow",
        requestText: extra,
        receiptId: "receipt-extra-field",
        payloadDigest: await sha256Hex(extra),
        sharedPaths: ["region", "service_category"],
        withheldPaths: ["secret"],
      },
    ]);

    await expect(dispatchToolCall(
      setup.ctx as never,
      entry as never,
      { request: '{"service_category":"housing"}' },
      "parent-span",
      [],
    )).rejects.toThrow("does not exactly match the payload");

    expect(setup.session.invoke).not.toHaveBeenCalled();
  });

  it("fails closed when an origin consent UI is not attached", async () => {
    const state = {
      consent: new Map<string, string>(),
      onConsent: undefined,
      consentTail: Promise.resolve(),
    };
    await expect(Engine.prototype.requestConsent.call(state, {
      peerOrigin: "https://unapproved.example",
      kind: "network-discovery",
    })).resolves.toBe("decline");
  });

  it("does not convert an absent consent response into approval", async () => {
    const state = {
      consent: new Map<string, string>(),
      onConsent: async () => undefined,
      consentTail: Promise.resolve(),
    };
    await expect(Engine.prototype.requestConsent.call(state, {
      peerOrigin: "https://unapproved.example",
      kind: "network-discovery",
    })).resolves.toBe("decline");
  });
});
