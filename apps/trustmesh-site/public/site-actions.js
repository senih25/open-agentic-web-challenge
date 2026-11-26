const DATA_URL = new URL("./data/service-directory.json", import.meta.url);

async function loadDirectory() {
  const response = await fetch(DATA_URL, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Service directory request failed with HTTP ${response.status}.`);
  return response.json();
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase("en").trim();
}

function getServiceDirectoryAction() {
  return {
    name: "get_service_directory",
    description: "Read the complete fictional demonstration directory of public-service information categories and sample entries. This is sample content only, not an official or live service registry. Changes nothing.",
    effect: "read",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    },
    execute: async () => {
      const data = await loadDirectory();
      return {
        notice: data.notice,
        categories: data.categories,
        services: data.services
      };
    }
  };
}

function searchServicesAction() {
  return {
    name: "search_services",
    description: "Search the fictional TrustMesh sample directory by query and optional category. Returns only sample records and their local reference identifiers. Changes nothing.",
    effect: "read",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", maxLength: 100, description: "Words to match in title, description or tags." },
        category: { type: "string", enum: ["housing", "tenancy", "employment", "education", "utilities", "general"] }
      },
      additionalProperties: false
    },
    execute: async (args) => {
      const data = await loadDirectory();
      const query = normalize(args.query);
      const category = normalize(args.category);
      const matches = data.services.filter((service) => {
        const haystack = normalize([
          service.title,
          service.description,
          ...(service.tags || [])
        ].join(" "));
        return (!category || service.category === category) && (!query || haystack.includes(query));
      });
      return {
        notice: data.notice,
        count: matches.length,
        services: matches.slice(0, 8)
      };
    }
  };
}

export function registerActions(actions) {
  actions.register(getServiceDirectoryAction());
  actions.register(searchServicesAction());
}
