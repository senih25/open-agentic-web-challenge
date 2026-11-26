const DATA_URL = new URL("./data/housing-guidance.json", import.meta.url);

async function readDataset() {
  const response = await fetch(DATA_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Housing guide request failed with HTTP ${response.status}.`);
  return response.json();
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase("en").trim();
}

function searchHousingGuidanceAction() {
  return {
    name: "search_housing_guidance",
    description: "Search this partner site's fictional read-only housing-information dataset by category and region. It returns sample topics, limits and source labels only. It does not assess eligibility, submit forms or contact an agency.",
    effect: "read",
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
        return (!category || haystack.includes(category) || category === "housing") &&
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
