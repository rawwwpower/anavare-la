"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  NARROW,
  REDUCED_MOTION,
  SheetContext,
  useMediaQuery,
} from "@/components/sheet-context";
import { useSwipeDismiss } from "@/components/use-swipe-dismiss";
import { NOTE_THEME_COLOR, pageTitle } from "@/lib/notes";
import { sheetSquirclePath } from "@/lib/squircle";

// A note as a layer, not as a page that replaced another page.
//
// The /rndm index stays mounted underneath this the whole time — that is the
// point of the intercepted route it arrives through (src/app/rndm/@sheet).
// Before, dragging a note away uncovered nothing: the body's own dark colour
// stood in for the index until the navigation landed and the index remounted
// and replayed its entrance. It looked like a layer for 200ms and then
// admitted it wasn't one. Now what is underneath is the actual index, and it
// never went anywhere, so the sheet can be let go of and it just leaves.
//
// Two surfaces move, so they are driven by one number. This writes
// --sheet-progress on the root: 0 with the sheet at rest, 1 with it gone.
// The sheet reads it never — it is transformed directly — and the ground
// (see .rndm-ground in globals.css) reads it for its scale and brightness.
// Passing the duration alongside it lets the ground transition itself in the
// same breath as the sheet instead of being ticked frame by frame from here,
// so the two layers cannot drift apart.
//
// On a phone it is a bottom sheet and says so: it stops short of the top so
// the index is never fully covered, it has a grabber, and its top corners are
// smoothed rather than merely rounded. On a wide screen none of that applies
// — the sheet doesn't travel there, so there is no lift to reinforce, and a
// note's artwork is position:fixed, which a transformed ancestor would tear
// out of its corner. There the sheet arrives and leaves by opacity, and still
// uncovers the real index.
const EASE = "var(--ease-sheet)";
const SLIDE_IN_MS = 420;
const SLIDE_OUT_MS = 300;
const FADE_MS = 200;

// How much of the index is left showing above the sheet: its whole title row,
// "rndm" with a margin's worth of air above and below it (Ana, October 2026).
// The index's own title stays readable under every note, so where you are,
// and the way back, is always on screen — and the strip is the close button.
const GAP = "calc(var(--page-pad-y) * 2 + 1.5rem)";

// The top corners, as iOS draws them: not a quarter circle but Figma's 60%
// corner smoothing, which starts the curve 1.6x the radius back along each
// edge. See src/lib/squircle.ts — CSS has no property for this yet that both
// browsers agree on, so it is a clip-path, computed once per size.
const RADIUS_PX = 32;
const SMOOTHING = 0.6;

function ground(progress: number, ms: number) {
  const s = document.documentElement.style;
  s.setProperty("--sheet-duration", `${ms}ms`);
  s.setProperty("--sheet-progress", `${progress}`);
}

function clearGround() {
  const s = document.documentElement.style;
  s.removeProperty("--sheet-duration");
  s.removeProperty("--sheet-progress");
}

export function NoteSheet({
  title,
  children,
  surface = NOTE_THEME_COLOR,
}: {
  // The note's own name. An intercepted route sits in a parallel slot and
  // Next builds <head> from the main tree, so while a sheet is open the
  // document still carries the index's title and its dark theme-colour. The
  // colour is the one that shows — it tints the phone's own chrome, and a
  // dark bar over a light note is just wrong — and the title is what a tab
  // and a bookmark say, so both are set here and put back on the way out.
  //
  // The canonical link is deliberately left alone: it is only ever read by a
  // crawler, and a crawler always gets the note's own page, where it is
  // already right.
  title: string;
  children: React.ReactNode;
  // The sheet's paper. Every note shares the same light surface unless it
  // asks for its own; the phone's chrome follows whichever it is.
  surface?: string;
}) {
  const router = useRouter();
  // Both queries are read every render on purpose — `&&` between two hook
  // calls would short-circuit one of them out of the render and break the
  // order React relies on.
  const narrow = useMediaQuery(NARROW);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const slides = narrow && !reduced;
  const outMs = slides ? SLIDE_OUT_MS : FADE_MS;

  // Decided once and then left alone. Turning a phone sideways mid-note must
  // not hand the content back an entrance it already played, restart one that
  // never ran, or reshape the surface out from under the reader.
  const [arrival] = useState<"slide" | "fade">(slides ? "slide" : "fade");
  const isBottomSheet = arrival === "slide";

  // The sheet only ever exists after a click on the index, so the entry
  // behind it is always that index: going back is what closes it, which
  // also means the browser's own back and forward close and reopen it.
  const leaving = useRef(false);
  const dismiss = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    router.back();
  }, [router]);

  // The sheet is fixed to the screen, so a note taller than it scrolls
  // inside it — never the index underneath, which would slide the dark page
  // past a sheet that does not move.
  const scrollRef = useRef<HTMLDivElement>(null);

  const sheetRef = useSwipeDismiss({
    axis: "down",
    scroller: scrollRef,
    enabled: slides,
    // Opaque all the way out. Fading it would show the index through the
    // note on its way off, which is two layers at once — the opposite of
    // what a sheet coming off something is supposed to look like.
    fade: false,
    exit: "offscreen",
    ease: EASE,
    onTrack: ground,
    onDismiss: dismiss,
  });

  // Placed before paint, so the sheet's first frame is already off-screen
  // (or transparent) rather than flashing at rest and then jumping away to
  // start its own arrival.
  useLayoutEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const sliding = arrival === "slide";
    const ms = sliding ? SLIDE_IN_MS : FADE_MS;

    ground(1, 0);
    if (sliding) el.style.transform = "translate3d(0, 100%, 0)";
    else el.style.opacity = "0";

    // Make the browser take that as the current value before the resting one
    // is set, so the transition has somewhere to start from. A rAF would do
    // the same and is the usual way to write this — but rAF doesn't run in a
    // tab that isn't being drawn, and a sheet that only arrives if you were
    // watching is a sheet that can be found parked off-screen. A forced
    // reflow always happens.
    void el.offsetHeight;

    el.style.transition = sliding
      ? `transform ${ms}ms ${EASE}`
      : `opacity ${ms}ms ${EASE}`;
    if (sliding) el.style.transform = "translate3d(0, 0, 0)";
    else el.style.opacity = "1";
    // The index pulls back as the note settles on top of it.
    ground(0, ms);

    return clearGround;
  }, [sheetRef, arrival]);

  // The smoothed corners. A clip-path needs real pixels, so it is measured
  // and re-measured on rotation rather than declared. Deliberately NOT paired
  // with a border-radius fallback: border-radius clips the background to a
  // quarter circle, and a smoothed corner reaches past that, so the two
  // together would intersect down to the plain rounded corner and quietly
  // undo the whole thing. It is one or the other.
  const surfaceRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = surfaceRef.current;
    if (!el || !isBottomSheet) return;

    if (!CSS.supports("clip-path", 'path("M 0 0")')) {
      el.style.borderTopLeftRadius = `${RADIUS_PX}px`;
      el.style.borderTopRightRadius = `${RADIUS_PX}px`;
      return;
    }

    const shape = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const path = sheetSquirclePath({
        width,
        height,
        radius: RADIUS_PX,
        smoothing: SMOOTHING,
      });
      el.style.clipPath = `path("${path}")`;
    };

    shape();
    const observer = new ResizeObserver(shape);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isBottomSheet]);

  // See the `title` prop: the head belongs to the index underneath.
  useLayoutEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const prevTitle = document.title;
    const prevColor = meta?.getAttribute("content") ?? null;

    document.title = pageTitle(title);
    meta?.setAttribute("content", surface);

    return () => {
      document.title = prevTitle;
      if (prevColor !== null) meta?.setAttribute("content", prevColor);
    };
  }, [title, surface]);

  // The exit link plays the same leaving as the gesture, at the pace of a
  // deliberate tap rather than a throw. A second tap while it is already on
  // its way out would restart the transition and stutter it.
  const closing = useRef(false);
  const close = useCallback(() => {
    const el = sheetRef.current;
    if (!el || closing.current || leaving.current) return;
    closing.current = true;
    el.style.transition = slides
      ? `transform ${outMs}ms ${EASE}`
      : `opacity ${outMs}ms ${EASE}`;
    if (slides) el.style.transform = "translate3d(0, 100%, 0)";
    else el.style.opacity = "0";
    ground(1, outMs);
    setTimeout(dismiss, outMs);
  }, [sheetRef, slides, outMs, dismiss]);

  // The strip of index left showing above the sheet — the "rndm" title row —
  // is also the way off it. Tapping there closes the sheet and leaves you on
  // the index, the way tapping the dimmed background does on iOS — and it is
  // a real button, so it is the one focusable thing in a sheet that
  // otherwise has none. That is the point: the exit link came out because the
  // drag says it better, but a drag is the one thing some people cannot do,
  // and "swipe or nothing" is not a choice. The button covers the whole
  // strip, so the title itself is the target.
  const tapStart = useRef<{ x: number; y: number } | null>(null);
  const onStripDown = useCallback((e: React.PointerEvent) => {
    tapStart.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onStripClick = useCallback(
    (e: React.MouseEvent) => {
      const from = tapStart.current;
      tapStart.current = null;
      // A drag that began up here still ends in a click, so only a press
      // that stayed put counts. 8px is the same travel the gesture uses to
      // decide a drag has started (AXIS_LOCK_PX), so the two agree on where
      // a tap stops being a tap.
      if (from && Math.hypot(e.clientX - from.x, e.clientY - from.y) > 8) return;
      close();
    },
    [close],
  );

  const sheet = useMemo(
    () => ({ close, bottom: isBottomSheet }),
    [close, isBottomSheet],
  );

  return (
    <div
      ref={sheetRef}
      // data-arrival tells the content inside not to play its own staggered
      // entrance on top of the sheet's: when the whole surface rises into
      // place, that IS the arrival, and running both is the same move twice.
      data-arrival={arrival}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
      style={{
        top: isBottomSheet ? GAP : 0,
        color: "var(--background)",
        willChange: slides ? "transform" : undefined,
      }}
    >
      <div
        ref={surfaceRef}
        aria-hidden
        className="absolute inset-0"
        style={{ background: surface }}
      />

      {isBottomSheet && (
        <>
          {/* First in tab order, so the way out is the first thing a
              keyboard reaches. Invisible until focused — for a thumb it is
              just the strip of index above the sheet. */}
          <button
            type="button"
            aria-label="close"
            onPointerDown={onStripDown}
            onClick={onStripClick}
            className="absolute inset-x-0 z-20 rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-zinc-500 focus-visible:outline-offset-[-2px]"
            style={{ top: `calc(-1 * ${GAP})`, height: GAP }}
          />

          {/* A sign, not a control: the whole screen is already the grab
              surface, so this has nothing to handle and nothing to
              announce. */}
          <div
            aria-hidden
            className="absolute top-3 left-1/2 z-10 h-[5px] w-9 -translate-x-1/2 rounded-full"
            style={{ background: "rgb(0 0 0 / 0.14)" }}
          />
        </>
      )}

      {/* NoteShell's <main> is `relative`, so the content paints above the
          surface layer without either of them needing a z-index. */}
      <div
        ref={scrollRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [touch-action:var(--swipe-touch-action,auto)]"
      >
        {/* shrink-0: without it, flex squeezes this box to the sheet's height
            and the content just overflows it, so it never changes size and
            the swipe never hears that the note grew past the fold. */}
        <div className="flex min-h-full shrink-0 flex-col">
          <SheetContext value={sheet}>{children}</SheetContext>
        </div>
      </div>
    </div>
  );
}
