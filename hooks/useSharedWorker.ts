"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to manage connection to the Void Shared Worker.
 * Provides a unified way for components to broadcast and listen for KG updates.
 */
export function useSharedWorker(onMessage?: (data: any) => void) {
  const workerRef = useRef<SharedWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.SharedWorker) return;

    try {
      const worker = new SharedWorker("/workers/void-worker.js");
      worker.port.onmessage = (event) => {
        if (onMessage) onMessage(event.data);
      };
      worker.port.start();
      workerRef.current = worker;
    } catch (e) {
      console.warn("[SharedWorker] Failed to connect.", e);
    }

    return () => {
      // Ports close automatically on tab close
    };
  }, [onMessage]);

  const notifyUpdate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.port.postMessage({ type: "KG_UPDATED" });
    }
  }, []);

  const broadcastCache = useCallback((key: string, data: any) => {
    if (workerRef.current) {
      workerRef.current.port.postMessage({ type: "CACHE_SET", payload: { key, data } });
    }
  }, []);

  return { notifyUpdate, broadcastCache };
}
