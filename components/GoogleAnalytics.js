"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, pageview } from "../lib/analytics";

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    console.log("🔍 GA Component: Initializing Google Analytics...");
    // Initialize Google Analytics
    initGA();
  }, []);

  useEffect(() => {
    // Track page views
    if (pathname) {
      console.log("🔍 GA Component: Tracking page view for:", pathname);
      pageview(pathname);
    }
  }, [pathname]);

  return null;
}
