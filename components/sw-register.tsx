"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production only.
 *
 * `next dev` never emits out/sw.js, and a stale worker during development is a
 * classic source of "my change isn't showing up", so registration is gated on
 * NODE_ENV. Any previously installed worker is unregistered in development for
 * the same reason.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => void reg.unregister());
      });
      return;
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        // Registration failure must never break the app — it only costs offline.
        console.warn("[kyreo] service worker registration failed:", error);
      });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
