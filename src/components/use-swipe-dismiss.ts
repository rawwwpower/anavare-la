"use client";

import { useEffect, useRef } from "react";

// Direct-manipulation dismissal for the /rndm pages: the sheet follows the
// finger 1:1 and leaves if the gesture had either enough distance or enough
// speed, so a short flick works as well as a long drag — making someone drag
// all the way to a threshold is what turns a gesture into a chore.
//
// The listeners sit on the document, not on the sheet, so the whole screen is
// the grab surface: the page gutters are 24px of dead zone on a phone, and a
// thumb reaching across for "go back" should not have to avoid them.
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
const LEAVE_MS = 200;
const LEAVE_EXTRA_PX = 120; // carries on past where the finger let go

export function useSwipeDismiss({
  axis,
  enabled,
  onDismiss,
}: {
  axis: Axis;
  enabled: boolean;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Read through a ref so a re-render can never swap the callback out from
  // under a gesture that is already running, and so the listeners below are
  // attached once instead of being torn down and rebuilt on every render.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const vertical = axis === "down";
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let travel = 0;
    let active = false;
    let locked = false;
    let leaving = false;

    // Claim one axis from the browser and leave it the other, so the page
    // gives us clean pointer events instead of scrolling underneath the
    // gesture. pinch-zoom stays listed in both cases: it costs nothing here
    // and taking it away is taking away someone's way of reading the page.
    //
    // A downward drag and a scroll are the same gesture, so the vertical
    // sheet only claims it while the page has nothing to scroll — true for
    // every note today, and it hands the gesture straight back if one ever
    // grows past the fold rather than fighting the scroll.
    let claimed = true;
    function syncTouchAction() {
      if (!vertical) {
        claimed = true;
        document.body.style.touchAction = "pan-y pinch-zoom";
        return;
      }
      claimed =
        document.documentElement.scrollHeight <= window.innerHeight + 1;
      document.body.style.touchAction = claimed ? "pan-x pinch-zoom" : "";
    }

    const offset = (d: number) =>
      vertical ? `translate3d(0, ${d}px, 0)` : `translate3d(${d}px, 0, 0)`;

    function paint(d: number) {
      const size = vertical ? window.innerHeight : window.innerWidth;
      el!.style.transform = offset(d);
      el!.style.opacity = `${1 - Math.min(d / (size * 0.5), 1) * FADE_MAX}`;
    }

    function settle() {
      el!.style.transition = `transform ${SNAP_MS}ms var(--ease-out), opacity ${SNAP_MS}ms var(--ease-out)`;
      el!.style.transform = "";
      el!.style.opacity = "";
      el!.style.willChange = "";
    }

    function leave(from: number) {
      leaving = true;
      el!.style.transition = `transform ${LEAVE_MS}ms var(--ease-out), opacity ${LEAVE_MS}ms var(--ease-out)`;
      el!.style.transform = offset(from + LEAVE_EXTRA_PX);
      el!.style.opacity = "0";
      setTimeout(() => dismissRef.current(), LEAVE_MS);
    }

    function onDown(e: PointerEvent) {
      if (leaving || !claimed || e.pointerType === "mouse") return;
      startX = e.clientX;
      startY = e.clientY;
      startT = performance.now();
      travel = 0;
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
        if (Math.abs(along) <= Math.abs(across)) {
          active = false;
          el!.style.willChange = "";
          return;
        }
        locked = true;
      }

      travel = along;
      paint(along < 0 ? along * RUBBER : along);
    }

    function onUp() {
      if (!active) return;
      active = false;
      if (!locked) return;

      const d = Math.max(travel, 0);
      const elapsed = performance.now() - startT;
      const speed = elapsed > 0 ? d / elapsed : 0;
      const size = vertical ? window.innerHeight : window.innerWidth;
      const threshold = Math.min(size * DISMISS_FRACTION, DISMISS_MAX_PX);

      if (d > threshold || (speed > FLICK_SPEED && d > FLICK_MIN_PX)) {
        leave(d);
      } else {
        settle();
      }
    }

    function onCancel() {
      if (!active) return;
      active = false;
      if (locked) settle();
    }

    syncTouchAction();
    window.addEventListener("resize", syncTouchAction);
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onCancel, { passive: true });

    return () => {
      window.removeEventListener("resize", syncTouchAction);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
      document.body.style.touchAction = "";
    };
  }, [axis, enabled]);

  return ref;
}
