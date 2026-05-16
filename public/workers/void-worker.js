/**
 * Void Intelligence Shared Worker
 * Synchronizes Knowledge Graph state and background tasks across all open tabs.
 */

const channel = new BroadcastChannel("void_kg_sync");
const ports = new Set();
let sharedCache = new Map();

self.onconnect = (event) => {
  const port = event.ports[0];
  ports.add(port);

  port.onmessage = (msg) => {
    const { type, payload } = msg.data;

    switch (type) {
      case "KG_UPDATED":
        // Broadcast to all other tabs
        channel.postMessage({ type: "REFRESH_REQUIRED", source: "SharedWorker" });
        break;
      case "CACHE_SET":
        sharedCache.set(payload.key, payload.data);
        break;
      case "CACHE_GET":
        port.postMessage({ type: "CACHE_RESULT", payload: sharedCache.get(payload.key) });
        break;
    }
  };

  port.start();
};

channel.onmessage = (event) => {
  // Listen for broadcast channel messages if any tab uses them directly
  if (event.data.type === "KG_UPDATED") {
    // Re-broadcast via ports for individual tab listeners
    ports.forEach(p => p.postMessage({ type: "REFRESH_REQUIRED" }));
  }
};
