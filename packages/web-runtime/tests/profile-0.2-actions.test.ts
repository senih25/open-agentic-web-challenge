import { describe, expect, it, vi } from "vitest";
import { dispatchToolCall, websiteToolRefusal } from "../runner.js";

function makeContext(effect: "read" | "write" | "irreversible", approved = true) {
  const order: string[] = [];
  const registered = {
    ref: "https://trustmesh.example/trustmesh#update_profile",
    name: "update_profile",
    description: "Update the local request draft.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    effect,
    availability: "local-only",
    base: "https://trustmesh.example",
    network: "trustmesh",
    execute: async () => {
      order.push("execute");
      return { ok: true };
    },
  };
  const confirmWebsiteActions = vi.fn(async (items: unknown[]) => {
    order.push("review");
    expect(items).toEqual([{
      action: "update_profile",
      description: "Update the local request draft.",
      origin: "https://trustmesh.example",
      effect,
      arguments: { value: "sanitized" },
    }]);
    return approved;
  });

  const actions = {
    entries: new Map([[registered.ref, registered]]),
    prepare: () => [{ entry: registered, args: { value: "sanitized" } }],
    execute: async (plan: Array<{ entry: typeof registered; args: unknown }>, confirm: (items: unknown[]) => Promise<boolean>) => {
      const accepted = await confirm([{
        action: plan[0]!.entry.name,
        description: plan[0]!.entry.description,
        origin: new URL(plan[0]!.entry.base).origin,
        effect: plan[0]!.entry.effect,
        arguments: plan[0]!.args,
      }]);
      order.push("after-review");
      if (!accepted) return null;
      const result = await plan[0]!.entry.execute();
      return [{ status: "succeeded", result }];
    },
  };

  return {
    order,
    registered,
    confirmWebsiteActions,
    context: {
      actions,
      manifest: { actions: { agentTools: ["update_profile"] } },
      baseOrigin: "https://trustmesh.example",
      network: { name: "trustmesh" },
      isTop: true,
      confirmWebsiteActions,
    },
  };
}

describe("MVP Profile 0.2 site-action review gate", () => {
  it.each(["write", "irreversible"] as const)(
    "reviews a %s action before executing it",
    async (effect) => {
      const setup = makeContext(effect, true);
      const result = await dispatchToolCall(
        setup.context as never,
        { kind: "website", ref: setup.registered.ref } as never,
        { value: "sanitized" },
        "test-span",
        [],
      );

      expect(setup.confirmWebsiteActions).toHaveBeenCalledTimes(1);
      expect(setup.order).toEqual(["review", "after-review", "execute"]);
      expect(result).toMatchObject({ status: "succeeded", result: { ok: true } });
    },
  );

  it("does not execute a write when the user declines", async () => {
    const setup = makeContext("write", false);
    const result = await dispatchToolCall(
      setup.context as never,
      { kind: "website", ref: setup.registered.ref } as never,
      { value: "sanitized" },
      "test-span",
      [],
    );

    expect(setup.confirmWebsiteActions).toHaveBeenCalledTimes(1);
    expect(setup.order).toEqual(["review", "after-review"]);
    expect(result).toMatchObject({
      action: setup.registered.ref,
      status: "cancelled",
    });
  });

  it("does not ask for confirmation for a read-only action", async () => {
    const setup = makeContext("read", true);
    const result = await dispatchToolCall(
      setup.context as never,
      { kind: "website", ref: setup.registered.ref } as never,
      { value: "sanitized" },
      "test-span",
      [],
    );

    expect(setup.confirmWebsiteActions).not.toHaveBeenCalled();
    expect(setup.order).toEqual(["after-review", "execute"]);
    expect(result).toMatchObject({ status: "succeeded" });
  });

  it("fails closed when a state-changing local action has no confirmation callback", () => {
    const setup = makeContext("write");
    const context = {
      ...setup.context,
      confirmWebsiteActions: undefined,
    };
    const reason = websiteToolRefusal(context as never, setup.registered as never);
    expect(reason).toContain("write");
    expect(reason).toContain("no confirmation dialog");
  });

  it("does not expose write actions from a peer network", () => {
    const setup = makeContext("write");
    const reason = websiteToolRefusal({
      ...setup.context,
      isTop: false,
    } as never, {
      ...setup.registered,
      availability: "bridge",
    } as never);
    expect(reason).toContain("read-only");
  });
});
