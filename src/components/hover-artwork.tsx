"use client";

import { useState } from "react";

// A piece anchored bottom-right (same corner and gutter as the home page's
// poster, at 2x its size) that swaps for a second image on hover — e.g. a
// clean painting that reveals its title/credit, blurred, once you look closer.
// Touch has no real hover, so a press does the same job there.
type HoverArtworkProps = {
  defaultSrc: string;
  hoverSrc: string;
  alt?: string;
};

export function HoverArtwork({
  defaultSrc,
  hoverSrc,
  alt = "",
}: HoverArtworkProps) {
  // The hover image is only fetched once something actually reveals it —
  // most visits never trigger it.
  const [everHovered, setEverHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  function onTouchDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    setEverHovered(true);
    setPressed(true);
  }
  function onTouchUp(e: React.PointerEvent) {
    if (e.pointerType === "mouse") return;
    setPressed(false);
  }

  return (
    <div
      className="group fixed z-40"
      style={{
        right: "var(--page-pad-x)",
        // Same shared shelf line the ball and the poster sit on
        // (globals.css), so every corner object aligns to one grid.
        bottom: "var(--shelf-bottom)",
        width: "clamp(176px, 28vw, 320px)",
      }}
      onPointerEnter={() => setEverHovered(true)}
      onPointerDown={onTouchDown}
      onPointerUp={onTouchUp}
      onPointerCancel={onTouchUp}
      onPointerLeave={onTouchUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={defaultSrc}
        alt={alt}
        draggable={false}
        className="w-full select-none transition-opacity duration-1000 ease-in-out group-hover:opacity-0"
        style={pressed ? { opacity: 0 } : undefined}
      />
      {everHovered && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hoverSrc}
          alt={alt}
          draggable={false}
          className="absolute inset-0 w-full select-none opacity-0 transition-opacity duration-1000 ease-in-out group-hover:opacity-100"
          style={pressed ? { opacity: 1 } : undefined}
        />
      )}
    </div>
  );
}
