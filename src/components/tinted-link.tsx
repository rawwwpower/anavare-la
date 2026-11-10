"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

// The phone's chrome (the bar behind the clock and the address) takes its
// colour from <meta name="theme-color">, and Next only swaps that tag once
// the next page has rendered. The browser then cross-fades the bar over a
// few hundred ms of its own, so on its own the bar trails the page: going
// from the red home to the dark /rndm, the top of the screen stayed red
// after the page had already turned dark (Ana, November 2026).
//
// Telling the browser at the tap instead starts its fade together with the
// page change, so the two arrive as one move. Next writes the same colour
// again when the page lands, which changes nothing.
export function tintChrome(color: string) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", color);
}

// A Link whose destination paints the chrome a different colour.
export function TintedLink({
  tint,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { tint: string }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        onClick?.(e);
        // A modified click opens a new tab: this page stays, so does its bar.
        const newTab = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
        if (!e.defaultPrevented && !newTab) tintChrome(tint);
      }}
    />
  );
}
