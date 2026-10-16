"use client";

import { useEffect, useRef } from "react";

// Direct-manipulation dismissal for the /rndm pages: the surface follows the
// finger 1:1 and leaves if the gesture had either enough distance or enough
// speed, so a short flick works as well as a long drag — making someone drag
// all the way to a threshold is what turns a gesture into a chore.
//
// The listeners sit on the document, not on the surface, so the whole screen
// is the grab surface: the page gutters are 24px of dead zone on a phone, and
// a thumb reaching across for "go back" should not have to avoid them. The
// flip side is that two enabled gestures would both answer the same drag, so
// whoever is not on top has to pass `enabled: false` (see CoveredContext).
//
// Touch only. A mouse already has "back"/"close" right there, and on a wide
// screen a note's artwork is position:fixed — transforming an ancestor would
// make it the containing block and rip the artwork out of its corner (see
// note-shell). The caller decides when that is safe via `enabled`.

type Axis = "down" | "right";

const DISMISS_FRACTION = 0.18; // of the viewport along the axis
const DISMISS_MAX_PX = 140; // ...but never ask a thumb for more than this
const FLICK_SPEED = 0.35; // px/ms — a light flick leaves regardless of distance
const FLICK_MIN_PX = 24; // ...as long as it actually went somewhere
const AXIS_LOCK_PX = 8; // travel before deciding whose gesture this is
const RUBBER = 0.28; // resistance dragging the wrong way, instead of a wall
const FADE_MAX = 0.35; // how far it dims while being dragged
const SNAP_MS = 260;
// After the content scrolls, no drag may dismiss for this long — vaul's
// scrollLockTimeout, at its default. Without it, a fast scroll back up that
// lands on the top hands the very next downward stroke to the sheet, and the
// note vanishes mid-read.
const SCROLL_LOCK_MS = 500;
const NUDGE_PX = 120; // how far past the finger a "nudge" exit carries on

// Speed is measured over the tail of the gesture, not its whole length: a
// slow drag that ends in a flick is a flick, and averaging the two reports a
// crawl. 100ms is long enough to survive a dropped frame and short enough
// that only the last inch of the movement counts.
const SPEED_WINDOW_MS = 100;

// An exit that leaves at the speed the finger gave it, floored and capped.
// The cap is what a surface let go of without much force takes to finish the
// move on its own — calm, not slow. The floor keeps the hardest flick from
// becoming a cut: past about 5px/ms there is nothing left to see anyway.
const LEAVE_MIN_MS = 150;
const LEAVE_MAX_MS = 380;

export function useSwipeDismiss({
  axis,
  enabled,
  onDismiss,
  onTrack,
  scroller,
  fade = true,
  exit = "nudge",
  ease = "var(--ease-out)",
}: {
  axis: Axis;
  enabled: boolean;
  onDismiss: () => void;
  // How far along the axis the surface has been pushed, 0-1, plus how long
  // it will take to get there — 0 while a finger is on it, the animation's
  // own duration once it is released. That pair is enough for a second layer
  // to move in step with this one without ticking a frame loop of its own.
  onTrack?: (progress: number, ms: number) => void;
  // A layer that scrolls inside itself (a sheet, whose page underneath never
  // moves) passes its scroll box here, so "is there anything to scroll" is
  // asked of the box the content actually lives in, not of the document.
  scroller?: React.RefObject<HTMLElement | null>;
  // Dimming as it goes only makes sense when there is nothing underneath to
  // reveal. A sheet lying on the index stays opaque: what it uncovers is the
  // point, and fading the sheet would show both layers at once.
  fade?: boolean;
  // "nudge" carries a little past where the finger let go and hands over to
  // a navigation; "offscreen" takes the surface all the way out, for a layer
  // that has to clear the screen before it is allowed to disappear.
  exit?: "nudge" | "offscreen";
  ease?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Read callbacks through refs so a re-render can never swap one out from
  // under a gesture that is already running, and so the listeners below are
  // attached once instead of being torn down and rebuilt on every render.
  const dismissRef = useRef(onDismiss);
  const trackRef = useRef(onTrack);
  useEffect(() => {
    dismissRef.current = onDismiss;
    trackRef.current = onTrack;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const vertical = axis === "down";
    let startX = 0;
    let startY = 0;
    let travel = 0;
    let active = false;
    let locked = false;
    let leaving = false;
    // Set when a gesture starts on a sheet that scrolls but is sitting at
    // the very top of its content. See onDown.
    let fromTop = false;
    // Rolling positions for the tail-end speed reading above.
    let samples: { t: number; d: number }[] = [];

    // Claim one axis from the browser and leave it the other, so the page
    // gives us clean pointer events instead of scrolling underneath the
    // gesture. pinch-zoom stays listed in both cases: it costs nothing here
    // and taking it away is taking away someone's way of reading the page.
    //
    // A downward drag and a scroll are the same gesture, so the vertical
    // sheet only claims it outright while there is nothing to scroll, and
    // hands it back to the browser the moment a note grows past the fold
    // rather than fighting the scroll. Re-checked whenever the content
    // changes size (an image or a font arriving can push it over). A note
    // that does scroll can still be pulled away from its top — see onDown.
    let claimed = true;
    function syncTouchAction() {
      if (!vertical) {
        claimed = true;
        document.body.style.touchAction = "pan-y pinch-zoom";
        return;
      }
      const box = scroller?.current;
      claimed = box
        ? box.scrollHeight <= box.clientHeight + 1
        : document.documentElement.scrollHeight <= window.innerHeight + 1;
      const action = claimed ? "pan-x pinch-zoom" : "";
      document.body.style.touchAction = action;
      // The browser only reads touch-action up to the nearest scroll box, so
      // on <body> alone it never reaches a sheet's own scroller: the browser
      // kept the vertical pan inside it and cancelled every drag, even on a
      // note short enough not to scroll. The same value goes out as a custom
      // property (those inherit) for the scroller to apply to itself — see
      // NoteSheet.
      document.body.style.setProperty("--swipe-touch-action", action || "auto");
    }

    const size = () => (vertical ? window.innerHeight : window.innerWidth);
    const offset = (d: number) =>
      vertical ? `translate3d(0, ${d}px, 0)` : `translate3d(${d}px, 0, 0)`;
    const transition = (ms: number) =>
      `transform ${ms}ms ${ease}` + (fade ? `, opacity ${ms}ms ${ease}` : "");

    function paint(d: number) {
      el!.style.transform = offset(d);
      if (fade) {
        el!.style.opacity = `${1 - Math.min(d / (size() * 0.5), 1) * FADE_MAX}`;
      }
      trackRef.current?.(Math.min(Math.max(d, 0) / size(), 1), 0);
    }

    function settle() {
      el!.style.transition = transition(SNAP_MS);
      el!.style.transform = "";
      el!.style.opacity = "";
      el!.style.willChange = "";
      trackRef.current?.(0, SNAP_MS);
    }

    // px/ms over the tail of the gesture, never negative — a finger that
    // reversed at the last moment has thrown the surface nowhere.
    function tailSpeed() {
      const now = performance.now();
      const recent = samples.filter((s) => now - s.t <= SPEED_WINDOW_MS);
      const first = recent[0] ?? samples[samples.length - 1];
      const last = samples[samples.length - 1];
      if (!first || !last || last.t === first.t) return 0;
      return Math.max((last.d - first.d) / (last.t - first.t), 0);
    }

    function leave(from: number, speed: number) {
      leaving = true;
      const target = exit === "offscreen" ? size() : from + NUDGE_PX;
      const remaining = Math.max(target - from, 1);
      // The throw keeps its own pace instead of restarting at a fixed one:
      // this is the whole difference between a surface that was let go and a
      // surface that was dismissed.
      const ms = Math.min(
        Math.max(remaining / Math.max(speed, 0.001), LEAVE_MIN_MS),
        LEAVE_MAX_MS,
      );
      el!.style.transition = transition(ms);
      el!.style.transform = offset(target);
      if (fade) el!.style.opacity = "0";
      trackRef.current?.(1, ms);
      setTimeout(() => dismissRef.current(), ms);
    }

    // A sheet whose note scrolls used to give up the gesture entirely, which
    // left a tall note on the phone with no way off but the 32px strip of
    // index above it. Now it follows vaul (the drawer the design system
    // uses): when its content is already at the very top, and has been still
    // for SCROLL_LOCK_MS, pulling down moves the sheet instead of scrolling;
    // anywhere else, or pushing up, the browser scrolls as usual.
    let lastScroll = 0;
    const onScroll = () => {
      lastScroll = performance.now();
    };
    const atTop = () => {
      const box = scroller?.current;
      return (
        vertical &&
        !!box &&
        box.scrollTop <= 0 &&
        performance.now() - lastScroll > SCROLL_LOCK_MS
      );
    };

    function onDown(e: PointerEvent) {
      // A second finger landing mid-drag would restart the gesture from
      // where it touched and make the sheet jump to it.
      if (active || leaving || e.pointerType === "mouse") return;
      fromTop = !claimed && atTop();
      if (!claimed && !fromTop) return;
      // Only this kind of gesture needs to cancel touch moves, so only it
      // pays for a non-passive listener, and only while the finger is down.
      if (fromTop) {
        document.addEventListener("touchmove", onTouchMove, { passive: false });
      }
      startX = e.clientX;
      startY = e.clientY;
      travel = 0;
      samples = [{ t: performance.now(), d: 0 }];
      active = true;
      locked = false;
      // Cancel a snap-back still in flight so the gesture is interruptible:
      // grabbing a sheet on its way home has to pick it up where it is,
      // not fight the transition.
      el!.style.transition = "";
      el!.style.willChange = "transform, opacity";
    }

    function onMove(e: PointerEvent) {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const along = vertical ? dy : dx;
      const across = vertical ? dx : dy;

      if (!locked) {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        // Whoever moved further wins. Guessing wrong is what makes a page
        // feel like it is grabbing at you, so bow out of the gesture
        // entirely rather than half-tracking it.
        // At the top of a scrolling note, only a pull downward is ours; a
        // push upward is the reader starting to scroll.
        if (Math.abs(along) <= Math.abs(across) || (fromTop && along <= 0)) {
          release();
          el!.style.willChange = "";
          return;
        }
        locked = true;
      }

      travel = along;
      const now = performance.now();
      samples.push({ t: now, d: along });
      // Two beyond the window is all tailSpeed ever needs to interpolate
      // across a dropped frame; the rest is a list that grows all gesture.
      while (samples.length > 2 && now - samples[1].t > SPEED_WINDOW_MS) {
        samples.shift();
      }
      paint(along < 0 ? along * RUBBER : along);
    }

    function release() {
      active = false;
      document.removeEventListener("touchmove", onTouchMove);
    }

    function onUp() {
      if (!active) return;
      release();
      if (!locked) return;

      const d = Math.max(travel, 0);
      const speed = tailSpeed();
      const threshold = Math.min(size() * DISMISS_FRACTION, DISMISS_MAX_PX);

      if (d > threshold || (speed > FLICK_SPEED && d > FLICK_MIN_PX)) {
        leave(d, speed);
      } else {
        settle();
      }
    }

    // touch-action can't change mid-gesture, so on a scrolling note the
    // browser still owns the pan when the finger lands. Cancelling the touch
    // moves of a downward pull from the top is what keeps it from scrolling
    // (or rubber-banding) the box, and from cancelling our pointer stream
    // with a pointercancel. Needs a non-passive listener to be allowed to.
    function onTouchMove(e: TouchEvent) {
      if (!active || !fromTop) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (locked || (dy > 0 && dy >= Math.abs(dx))) e.preventDefault();
    }

    function onCancel() {
      if (!active) return;
      release();
      if (locked) settle();
    }

    syncTouchAction();
    window.addEventListener("resize", syncTouchAction);
    const content = scroller?.current?.firstElementChild ?? document.body;
    const resized = new ResizeObserver(syncTouchAction);
    resized.observe(content);
    const box = scroller?.current;
    box?.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onCancel, { passive: true });

    return () => {
      window.removeEventListener("resize", syncTouchAction);
      resized.disconnect();
      box?.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
      document.removeEventListener("touchmove", onTouchMove);
      document.body.style.touchAction = "";
      document.body.style.removeProperty("--swipe-touch-action");
    };
  }, [axis, enabled, fade, exit, ease, scroller]);

  return ref;
}
