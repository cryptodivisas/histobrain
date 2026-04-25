"use client";

import { useEffect, useRef } from "react";

type AdFormat = "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";

interface AdSlotProps {
  /** Slot ID created in the AdSense console (digits only, e.g. "1234567890"). */
  slot: string;
  /** AdSense format string. "auto" = responsive. */
  format?: AdFormat;
  /** Set true when the ad should fill its container height. */
  fullWidthResponsive?: boolean;
  /** Minimum height reserved to prevent CLS while the ad loads. */
  minHeight?: number;
  /** Optional label shown above the slot ("Advertisement"). */
  showLabel?: boolean;
  /** Extra className merged onto the wrapper. */
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Renders a single AdSense unit. The <ins> tag is the standard AdSense
 * slot markup; we push an empty object onto window.adsbygoogle to kick
 * off the fill, exactly as the AdSense snippet does.
 *
 * No-op when NEXT_PUBLIC_ADSENSE_CLIENT_ID is not configured.
 */
export default function AdSlot({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  minHeight = 250,
  showLabel = true,
  className = "",
}: AdSlotProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!clientId) return;
    if (pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* Ad blocker or adsbygoogle not loaded yet; AdSense will retry. */
    }
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div
      className={`w-full flex flex-col items-center ${className}`}
      style={{ minHeight }}
    >
      {showLabel ? (
        <span
          className="text-[10px] tracking-widest text-[var(--hb-muted)] mb-1 opacity-70"
          style={{ fontFamily: "var(--font-pixel-heading), monospace" }}
        >
          ADVERTISEMENT
        </span>
      ) : null}
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
