"use client";

import { useEffect, useState } from "react";

// A poster that only exists while you touch/press its own bottom-right
// corner — like a projector that's only on while a hand holds the switch.
// Scoped to that corner (not the whole right half): the bio text can wrap
// into the right side of the screen on mobile, and a press-and-hold there
// needs to stay a normal text-selection gesture, not fight this one.
const IMAGE_SRC = "/toys/sopa-de-cerebro-de-mono.jpg";
const ZONE_X_RATIO = 0.6; // rightmost 40% of the viewport
const ZONE_Y_RATIO = 0.55; // bottom 45% of the viewport

export function PosterProjection() {
  const [visible, setVisible] = useState(false);
  // Most visitors never touch this corner, so the image is only requested
  // the first time it's actually revealed — not on every page load.
  const [revealedOnce, setRevealedOnce] = useState(false);

  useEffect(() => {
    function onDown(e: PointerEvent) {
      const inZone =
        e.clientX > window.innerWidth * ZONE_X_RATIO &&
        e.clientY > window.innerHeight * ZONE_Y_RATIO;
      if (inZone) {
        setVisible(true);
        setRevealedOnce(true);
      }
    }
    function onUp() {
      setVisible(false);
    }

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-40 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{
        right: "var(--page-pad-x)",
        // Same invisible baseline the ball rests on — a shared design
        // token (globals.css), not measured, so the two can never drift.
        bottom: "var(--shelf-bottom)",
        width: "clamp(88px, 14vw, 160px)",
        opacity: visible ? 1 : 0,
        filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.55))",
      }}
    >
      {revealedOnce && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={IMAGE_SRC}
          alt=""
          draggable={false}
          className="w-full select-none"
        />
      )}
    </div>
  );
}
