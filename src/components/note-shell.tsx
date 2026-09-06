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

// The shell every /rndm page shares — a note and the index itself.
//
// The site has two surfaces. The index is the same dark ground as the home
// page, because it belongs to it; a note is a light sheet lying on top of
// that ground. That is not decoration: it is what makes dragging a note down
// read as a sheet being pushed away rather than a page scrolling, because
// the dark index is right there underneath the whole time.
//
// Content reveals on arrival (staggered, CSS-driven so it survives a busy
// main thread) and leaves two ways: the exit link, which slides the text
// down and dissolves the sheet's surface under it, or a swipe, which hands
// the same exit to the finger and moves the surface with it. The index sits
// beside the home page, so it leaves sideways; a note sits on top of the
// index, so it leaves downward.
//
// Only <main> and the text box get transforms. The artwork stays out of both
// on desktop (a transform on an ancestor makes it the containing block for a
// fixed-position descendant, which would yank a sm:fixed artwork out of its
// viewport corner) — its wrapper animates opacity only, which is safe. For
// the same reason that wrapper must never get `will-change: opacity`: that
// creates a containing block too.
//
// Everything sits above a single flex-1 spacer, so the exit link lands on
// the same pixel on every page regardless of how tall the artwork is.
const CLOSE_MS = 180;
const FADE_MS = 140;

const exitShape =
  "-ml-3 inline-flex min-h-11 items-center px-3 text-base underline underline-offset-4 transition-[color,text-decoration-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 rounded-sm";

// The same roles on both surfaces, in one place, so a shared component never
// has to hard-code which page it happens to be on. `dark` mirrors the home
// page's palette exactly — the index is the home page's own ground.
const TONES = {
  dark: {
    title: "text-zinc-100",
    exit: "text-zinc-400 decoration-zinc-600 hover:text-zinc-100 hover:decoration-zinc-400 focus-visible:text-zinc-100",
  },
  light: {
    title: "text-zinc-900",
    exit: "text-zinc-500 decoration-zinc-400 hover:text-zinc-900 hover:decoration-zinc-600 focus-visible:text-zinc-900",
  },
};

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

export function NoteShell({
  children,
  title,
  titleAria,
  artwork,
  exitTo = "/rndm",
  exitLabel = "close",
  dismiss = "down",
  tone = "light",
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
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const palette = TONES[tone];

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
    <main
      ref={sheetRef}
      className="relative flex flex-1 flex-col px-[var(--page-pad-x)] py-[var(--page-pad-y)]"
      style={tone === "light" ? { color: "var(--background)" } : undefined}
    >
      {tone === "light" && (
        // The sheet's own surface, as a layer rather than a background on
        // <main>: a swipe carries it along with the content, and the exit
        // link can dissolve it on its own without fading the text twice.
        // Either way the dark index is what shows through.
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity ease-out"
          style={{
            background: "var(--foreground)",
            transitionDuration: `${CLOSE_MS}ms`,
            opacity: closing ? 0 : 1,
          }}
        />
      )}

      <div className="relative mx-auto flex w-full flex-1 flex-col">
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
              className={`text-base font-semibold tracking-tight ${palette.title}`}
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
          <a
            href={exitTo}
            onClick={handleClose}
            className={`${exitShape} ${palette.exit}`}
          >
            {exitLabel}
          </a>
        </nav>
      </div>
    </main>
  );
}
