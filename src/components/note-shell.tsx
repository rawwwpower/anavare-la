"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { useSwipeDismiss } from "@/components/use-swipe-dismiss";

// Below sm: the breakpoint where a note's artwork stops being fixed to the
// corner and rides along in normal flow. Subscribed to rather than read
// once, so rotating a phone doesn't leave the gesture in the wrong mode.
const NARROW = "(max-width: 639.98px)";
let mql: MediaQueryList | null = null;
const getMql = () => (mql ??= window.matchMedia(NARROW));
const subscribeNarrow = (onChange: () => void) => {
  const m = getMql();
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
};

// The shell every /rndm page shares — a note and the index itself. Content
// reveals on arrival (staggered, CSS-driven so it survives a busy main
// thread) and leaves two ways: the exit link, which slides the text down and
// fades it like a sheet closing, or a swipe, which hands the same exit to
// the finger. The index sits beside the home page, so it leaves sideways; a
// note sits on top of the index, so it leaves downward.
//
// Only the sheet gets a transform. The artwork stays out of any transformed
// box on desktop (a transform on an ancestor makes it the containing block
// for a fixed-position descendant, which would yank a sm:fixed artwork out
// of its viewport corner) — its wrapper animates opacity only, which is
// safe. For the same reason the wrapper must never get `will-change:
// opacity`: that creates a containing block too.
//
// Both sit above a single flex-1 spacer, so the exit link lands on the same
// pixel on every page regardless of how tall the artwork is on mobile.
const CLOSE_MS = 180;
const FADE_MS = 140;

const exitClassName =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base text-zinc-500 underline decoration-zinc-400 underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out hover:text-zinc-900 hover:decoration-zinc-600 active:scale-[0.97] focus-visible:text-zinc-900 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

export function NoteShell({
  children,
  title,
  titleAria,
  artwork,
  exitTo = "/rndm",
  exitLabel = "close",
  dismiss = "down",
}: {
  children: React.ReactNode;
  // Shown at the top in the same type as the home page's "A", at the same
  // height. titleAria carries what the short word stands for, so shortening
  // a heading visually never shortens it for a screen reader.
  title: string;
  titleAria: string;
  artwork?: React.ReactNode;
  exitTo?: string;
  exitLabel?: string;
  dismiss?: "down" | "right";
}) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);

  // A note's artwork is fixed to the corner from sm: up, and the swipe moves
  // the whole sheet — so the gesture is only offered where the artwork rides
  // along in normal flow. That is also the only place it is wanted: the
  // phone, where reaching the exit link with a thumb is the actual cost.
  const isNarrow = useSyncExternalStore(
    subscribeNarrow,
    () => getMql().matches,
    // Server-side there is no viewport: assume wide, so the gesture stays
    // off until hydration can actually tell.
    () => false,
  );
  const canSwipe = artwork ? isNarrow : true;

  // Warm the destination while the reader is still reading, so the exit
  // animation is the only wait — not the animation plus a fetch.
  useEffect(() => {
    router.prefetch(exitTo);
  }, [router, exitTo]);

  const go = useCallback(() => router.push(exitTo), [router, exitTo]);

  const sheetRef = useSwipeDismiss({
    axis: dismiss,
    enabled: canSwipe,
    onDismiss: go,
  });

  function handleClose(e: React.MouseEvent) {
    e.preventDefault();
    if (closing) return;
    setClosing(true);
    setTimeout(go, CLOSE_MS);
  }

  return (
    <div ref={sheetRef} className="mx-auto flex w-full flex-1 flex-col">
      <div
        className="transition-[transform,opacity] ease-sheet"
        style={{
          transitionDuration: `${CLOSE_MS}ms`,
          transform: closing ? "translateY(12%)" : "translateY(0)",
          opacity: closing ? 0 : 1,
        }}
      >
        <div className="reveal min-h-[var(--heading-block)]">
          <h1
            aria-label={titleAria}
            className="text-base font-semibold tracking-tight text-zinc-900"
          >
            {title}
          </h1>
        </div>

        {/* Starts exactly where the home page's paragraph does. The reveal
            belongs to the content itself, not to this box: a list wants to
            stagger item by item, and animating both would play the same
            move twice on top of itself. */}
        <div className="mt-12 sm:mt-14">{children}</div>
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
        style={
          {
            "--reveal-delay": "120ms",
            transitionDuration: `${FADE_MS}ms`,
            opacity: closing ? 0 : 1,
          } as CSSProperties
        }
      >
        <a href={exitTo} onClick={handleClose} className={exitClassName}>
          {exitLabel}
        </a>
      </nav>
    </div>
  );
}
