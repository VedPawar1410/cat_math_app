"use client";

import { useEffect } from "react";

// next-pwa only injects its registration script into the Pages Router entry
// (main.js), which an App Router page never loads, so it is done here instead.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      // The page that registers the worker was fetched before it existed, so
      // store the home page now or the first offline launch would have nothing.
      .then(() => caches.open("start-url"))
      .then((cache) => cache.add("/"))
      .catch((error) => console.error("Service worker setup failed", error));
  }, []);

  return null;
}
