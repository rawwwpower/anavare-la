"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react";
import {
  NARROW,
  useCovered,
  useMediaQuery,
  useSheet,
} from "@/components/sheet-context";
import { useSwipeDismiss } from "@/components/use-swipe-dismiss";

// The shell every /rndm page shares — a note and the index itself.
//
// The site has two surfaces. The index is the same dark ground as the home
// page, because it belongs to it; a note is a light sheet lying on top of
// that ground. That is not decoration: it is what makes dragging a note down
// read as a sheet being pushed away rather than a page scrolling, because
// the dark index is right there underneath the whole time.
//
// A note opened from the index is carried by NoteSheet, which owns the
// surface, the gesture and the leaving for real — the index it uncovers is
// still mounted behind it. This shell then only holds the content. Reached
// by its own URL there is nothing underneath, so it goes back to owning all
// three itself: same note, same exit, one layer instead of two.
//
// Content reveals on arrival (staggered, CSS-driven so it survives a busy
// main thread) and leaves two ways: the exit link, which slides the text
// down and dissolves the sheet's surface under it, or a swipe, which hands
// the same exit to the finger and moves the surface with it. The index sits
// beside the home page, so it leaves sideways; a note sits on top of the
// index, so it leaves downward.
//
// In the phone's bottom sheet there is no link. The grabber, the 32px of
// index showing above it and the sheet's own corners already say the thing
// is loose and can be pushed off, so a word saying "close" underneath is the
// interface explaining itself twice. Everywhere the drag does NOT exist the
// link stays and is the only way out: the index, a note reached by its own
// URL, a wide screen, and anyone who asked for reduced motion.
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
    exit: "text-zinc-400 decoration-zinc-600 hover:text-accent hover:decoration-accent focus-visible:text-accent",
  },
  light: {
    title: "text-zinc-900",
    exit: "text-zinc-500 decoration-zinc-400 hover:text-accent hover:decoration-accent focus-visible:text-accent",
  },
};

export function NoteShell({
  children,
  title,
  titleAria,
  artwork,
  surface = "var(--foreground)",
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
  // The light sheet's paper, for a note reached by its own URL. Opened from
  // the index, the sheet is NoteSheet's and takes its `surface` instead.
  surface?: string;
  exitTo?: string;
  exitLabel?: string;
  dismiss?: "down" | "right";
  tone?: "dark" | "light";
}) {
  const router = useRouter();
  const [closing, setClosing] = useState(false);
  const palette = TONES[tone];

  // Inside a sheet, that sheet is the layer that moves and it already has
  // the finger; underneath one, this page is scenery. Either way the shell
  // keeps its own hands off — two gestures listening on the same document
  // would both answer the same drag.
  const sheet = useSheet();
  const covered = useCovered();

  // A note's artwork is fixed to the corner from sm: up, and the swipe moves
  // the whole sheet — so the gesture is only offered where the artwork rides
  // along in normal flow. That is also the only place it is wanted: the
  // phone, where reaching the exit link with a thumb is the actual cost.
  const isNarrow = useMediaQuery(NARROW);
  const canSwipe = !sheet && !covered && (artwork ? isNarrow : true);

  // Warm the destination while the reader is still reading, so the exit
  // animation is the only wait — not the animation plus a fetch. Inside a
  // sheet the way out is the history entry the index already occupies.
  useEffect(() => {
    if (!sheet) router.prefetch(exitTo);
  }, [router, exitTo, sheet]);

  const go = useCallback(() => router.push(exitTo), [router, exitTo]);

  const sheetRef = useSwipeDismiss({
    axis: dismiss,
    enabled: canSwipe,
    onDismiss: go,
  });

  // Reached by its own URL, the note is the whole page, so the canvas behind
  // <body> takes its paper too. That canvas is what a phone shows wherever
  // the page does not reach — the strip a collapsing toolbar uncovers while
  // scrolling, an overscroll at either end — and left alone it is the site's
  // dark ground, flashing under a light note. <body> itself stays dark, so a
  // closing note still dissolves onto the index's colour, not onto paper.
  const ownsPage = tone === "light" && !sheet;
  useLayoutEffect(() => {
    if (!ownsPage) return;
    const html = document.documentElement.style;
    const prev = html.backgroundColor;
    html.backgroundColor = surface;
    return () => {
      html.backgroundColor = prev;
    };
  }, [ownsPage, surface]);

  function handleClose(e: React.MouseEvent) {
    e.preventDefault();
    if (sheet) {
      sheet.close();
      return;
    }
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
      {tone === "light" && !sheet && (
        // The sheet's own surface, as a layer rather than a background on
        // <main>: a swipe carries it along with the content, and the exit
        // link can dissolve it on its own without fading the text twice.
        // Either way the dark index is what shows through. Carried by a real
        // sheet, that surface belongs to the sheet instead.
        <div
          aria-hidden
          className="absolute inset-0 transition-opacity ease-out"
          style={{
            background: surface,
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
              className={`text-xl leading-6 font-semibold tracking-tight ${palette.title}`}
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

        {/* Kept even with no link below it, so the content above lands on
            the same pixel whether or not the exit is drawn. */}
        <div className="flex-1" />

        {!sheet?.bottom && (
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
        )}
      </div>
    </main>
  );
}
