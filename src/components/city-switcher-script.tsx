"use client";

import { useEffect } from "react";

/** Progressive enhancement: navigate when the city select changes. */
export function CitySwitcherScript() {
  useEffect(() => {
    const handler = (event: Event) => {
      const target = event.target as HTMLSelectElement | null;
      if (!target?.matches("[data-city-switcher]")) return;
      const slug = target.value;
      if (slug) window.location.assign(`/${slug}`);
    };
    document.addEventListener("change", handler);
    return () => document.removeEventListener("change", handler);
  }, []);

  return null;
}
