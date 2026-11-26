async function startPartnerRuntime(): Promise<void> {
  const status = document.getElementById("assistant-status");
  try {
    const runtimeUrl = new URL("/runtime/index.js", window.location.origin).href;
    const { boot } = await import(/* @vite-ignore */ runtimeUrl);
    const booted = await boot("#agent-app", {
      originUrl: new URL("/", window.location.href).href,
      sandboxWorkerUrl: new URL("/runtime/sandbox-worker.js", window.location.origin).href,
    });
    if (status) {
      status.textContent = booted.engine.mockLLM
        ? "The demo model is ready."
        : "Add your AI provider key in the settings panel to start a conversation.";
    }
    (window as Window & { __trustmeshPartnerEngine?: unknown }).__trustmeshPartnerEngine = booted.engine;
  } catch (error) {
    if (status) status.textContent = "The partner assistant could not load. The sample dataset remains available below.";
    console.error("Open Housing Guide runtime startup failed", error);
  }
}

void startPartnerRuntime();
