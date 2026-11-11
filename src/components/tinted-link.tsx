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
//
// Instagram's in-app browser (iPhone, November 2026) paints its bar one
// change behind: each time theme-color changes it shows the value it had
// before, and only catches up when its own toolbar unfolds. Opened from an
// Instagram link, /rndm sat under the home's red bar and the home under the
// index's dark one (Ana's screen recording). So every change ends in two
// steps: a twin one off in the last hex digit — invisible — and then the
// colour itself. Whatever lags one change behind lands on the twin; a
// browser that reads the tag right gets the colour, as before.
let pending = 0;

export function tintChrome(color: string) {
  const run = ++pending;
  // Looked up on every write: Next replaces the tag when the page lands.
  const write = (value: string) => {
    if (run !== pending) return;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", value);
  };
  // The twin at the tap, so the bar's fade starts with the page change.
  // Next writes the real colour again once the page lands, often within the
  // same frame, which the app can take as no change at all — so the twin is
  // written again after the landing, and the colour itself 100ms after
  // that: two writes in one frame would reach the app as a single change.
  // The twin already reads as the colour, so none of this ever shows.
  write(twin(color));
  setTimeout(() => write(twin(color)), 100);
  setTimeout(() => write(color), 200);
}

// The same colour one step away in its last hex digit (#121317 -> #121316).
function twin(color: string) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color;
  const n = parseInt(color.slice(1), 16);
  const blue = n & 0xff;
  return `#${(blue > 0 ? n - 1 : n + 1).toString(16).padStart(6, "0")}`;
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
