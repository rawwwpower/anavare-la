"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// The shell every /rndm page shares — a note and the index itself. Content
// reveals on arrival (staggered, CSS-driven so it survives a busy main
// thread) and closes like a bottom sheet: the text slides down and fades,
// the artwork and the exit link fade out slightly ahead of it, then it
// navigates.
//
// Only the text gets a transform. The artwork stays out of any transformed
// box (a transform on an ancestor makes it the containing block for a
// fixed-position descendant, which would yank a sm:fixed artwork out of its
// viewport corner the instant the animation starts) — its wrapper animates
// opacity only, which is safe. For the same reason the wrapper must never
// get `will-change: opacity`: that creates a containing block too.
//
// Both sit above a single flex-1 spacer, so the exit link lands at the same
// pixel on every page regardless of how tall the artwork is on mobile.
const CLOSE_MS = 180;
const FADE_MS = 140;

const exitClassName =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base text-zinc-500 underline decoration-zinc-400 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-zinc-900 hover:decoration-zinc-600 active:scale-[0.97] focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export function NoteShell({
  children,
  artwork,
  exitTo = "/rndm",
  exitLabel = "close",
}: {
  children: React.ReactNode;
  artwork?: React.ReactNode;
  exitTo?: string;
  exitLabel?: string;
}) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);

  // Warm the destination while the reader is still reading, so the 180ms
  // close animation is the only wait — not the animation plus a fetch.
  useEffect(() => {
    router.prefetch(exitTo);
  }, [router, exitTo]);

  function handleClose(e: React.MouseEvent) {
    e.preventDefault();
    if (closing) return;
    setClosing(true);
    setTimeout(() => router.push(exitTo), CLOSE_MS);
  }

  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      <div
        className="reveal transition-[transform,opacity] ease-sheet"
        style={{
          transitionDuration: `${CLOSE_MS}ms`,
          transform: closing ? "translateY(12%)" : "translateY(0)",
          opacity: closing ? 0 : 1,
        }}
      >
        {children}
      </div>

      {artwork && (
        <div
          className="transition-opacity ease-out"
          style={{
            transitionDuration: `${FADE_MS}ms`,
            opacity: closing ? 0 : 1,
          }}
        >
          {artwork}
        </div>
      )}

      <div className="flex-1" />

      <nav
        aria-label={exitLabel}
        className="reveal transition-opacity ease-out"
        style={{
          "--reveal-delay": "120ms",
          transitionDuration: `${FADE_MS}ms`,
          opacity: closing ? 0 : 1,
        } as React.CSSProperties}
      >
        <a href={exitTo} onClick={handleClose} className={exitClassName}>
          {exitLabel}
        </a>
      </nav>
    </div>
  );
}
