async function loadData() {
  const status = document.getElementById("dataset-status");
  const grid = document.getElementById("dataset-grid");
  try {
    const response = await fetch("./data/housing-guidance.json", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dataset = await response.json();
    status.textContent = dataset.notice;
    for (const record of dataset.records) {
      const card = document.createElement("article");
      card.className = "dataset-card";
      const title = document.createElement("h3");
      title.textContent = record.title;
      const tag = document.createElement("span");
      tag.className = "dataset-tag";
      tag.textContent = `${record.category} · ${record.region}`;
      const summary = document.createElement("p");
      summary.textContent = record.overview;
      const topics = document.createElement("p");
      topics.textContent = `Topics: ${record.topics.join(", ")}`;
      card.append(tag, title, summary, topics);
      grid.append(card);
    }
  } catch (error) {
    status.textContent = `Could not load the sample dataset: ${error instanceof Error ? error.message : "unknown error"}`;
  }
}
void loadData();
