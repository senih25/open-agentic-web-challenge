import { describe, expect, it } from "vitest";
import { browserMockCompletion } from "../llm.js";

describe("offline browser mock", () => {
  it("uses a declared mock example for the consent-first peer handoff", () => {
    const tools = [
      {
        type: "function",
        function: {
          name: "website_get_service_directory",
          description: "Read local sample data.",
          parameters: { type: "object", properties: {}, additionalProperties: false },
        },
      },
      {
        type: "function",
        function: {
          name: "open_housing_guide",
          description: "Call the independent sample housing guide.",
          parameters: {
            type: "object",
            properties: {
              request: {
                type: "string",
                description: 'A JSON object. Mock example: {"service_category":"housing","region":"Izmir","request_summary":"Find general housing guidance."}',
              },
            },
            required: ["request"],
          },
        },
      },
    ];

    const completion = browserMockCompletion(
      [{ role: "user", content: "Find housing guidance in Izmir." }],
      tools,
    );

    expect(completion.toolCalls).toHaveLength(1);
    expect(completion.toolCalls[0]?.function.name).toBe("open_housing_guide");
    expect(JSON.parse(completion.toolCalls[0]!.function.arguments)).toEqual({
      request: JSON.stringify({
        service_category: "housing",
        region: "Izmir",
        request_summary: "Find general housing guidance.",
      }),
    });
    expect(completion.model).toBe("neuro-san-mock-browser");
  });

  it("does not repeatedly call the mock-example peer after it has returned", () => {
    const tools = [{
      type: "function",
      function: {
        name: "open_housing_guide",
        parameters: {
          type: "object",
          properties: {
            request: {
              type: "string",
              description: 'Mock example: {"service_category":"housing"}',
            },
          },
          required: ["request"],
        },
      },
    }];
    const completion = browserMockCompletion([
      { role: "user", content: "Find housing guidance." },
      { role: "tool", name: "open_housing_guide", content: "Sample results returned." },
    ], tools);

    expect(completion.toolCalls).toHaveLength(0);
    expect(completion.content).toContain("Sample results returned.");
  });
});
