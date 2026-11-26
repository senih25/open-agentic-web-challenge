const DATA_URL = new URL("../data/housing-guidance.json", import.meta.url);

async function readDataset() {
  const response = await fetch(DATA_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Partner dataset request failed with HTTP ${response.status}.`);
  return response.json();
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase("en").trim();
}

function searchHousingGuidanceAction() {
  return {
    name: "search_housing_guidance",
    description: "Read this partner site's fictional public housing-information sample dataset. Read-only; no user profile or account data is accessible.",
    effect: "read",
    availability: "bridge",
    callerOrigins: ["__TRUSTMESH_ORIGIN__"],
    inputSchema: {
      type: "object",
      properties: {
        service_category: { type: "string", maxLength: 50 },
        region: { type: "string", maxLength: 80 },
        request_summary: { type: "string", maxLength: 300 }
      },
      additionalProperties: false
    },
    execute: async (args) => {
      const data = await readDataset();
      const category = normalize(args.service_category);
      const region = normalize(args.region);
      const query = normalize(args.request_summary);
      const records = data.records.filter((record) => {
        const haystack = normalize([
          record.category,
          record.region,
          record.title,
          record.overview,
          ...(record.topics || [])
        ].join(" "));
        return (!category || category === "housing" || haystack.includes(category)) &&
          (!region || record.region === "general" || normalize(record.region).includes(region) || region.includes(normalize(record.region))) &&
          (!query || haystack.includes(query) || query.split(/\s+/).some((word) => word.length > 3 && haystack.includes(word)));
      });
      return {
        notice: data.notice,
        count: records.length,
        records: records.slice(0, 5),
        no_eligibility_decision: true,
        no_application_submitted: true
      };
    }
  };
}

export function registerActions(actions) {
  actions.register(searchHousingGuidanceAction());
}
