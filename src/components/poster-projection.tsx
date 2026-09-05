"use client";

import { useEffect, useState } from "react";

// A poster that only exists while you touch/press the right side of the
// screen — like a projector that's only on while a hand holds the switch.
const IMAGE_SRC = "/toys/sopa-de-cerebro-de-mono.jpg";
const RIGHT_ZONE_RATIO = 0.6; // rightmost 40% of the viewport triggers it

export function PosterProjection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (e.clientX > window.innerWidth * RIGHT_ZONE_RATIO) setVisible(true);
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
      className="pointer-events-none fixed z-40 transition-opacity duration-300 ease-out"
      style={{
        right: "var(--page-pad-x)",
        // Same invisible baseline the ball rests on (published by
        // BouncyBall), so the two form a shared bottom grid line.
        bottom: "var(--shelf-bottom, var(--page-pad-y))",
        width: "clamp(88px, 14vw, 160px)",
        opacity: visible ? 1 : 0,
        filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.55))",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGE_SRC}
        alt=""
        draggable={false}
        className="w-full select-none"
      />
    </div>
  );
}
