"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface LiveRefreshProps {
  interval?: number; // milliseconds
}

/**
 * @component LiveRefresh
 * @description A silent component that periodically refreshes the current page's data
 * using Next.js router.refresh(). This allows Server Components on the page to
 * re-fetch data from the database without a full browser reload.
 */
export const LiveRefresh = ({ interval = 30000 }: LiveRefreshProps) => {
  const router = useRouter();

  useEffect(() => {
    // Set up the interval to refresh the page data
    const refreshInterval = setInterval(() => {
      router.refresh();
    }, interval);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [router, interval]);

  // This component doesn't render any UI as per user request
  return null;
};
