"use client";

import { useEffect, useRef, useState } from "react";

// A piece anchored bottom-right (same corner and gutter as the home page's
// poster, at 2x its size). With hoverSrc, it swaps for a second image on
// hover — e.g. a clean painting that reveals its title/credit, blurred, once
// you look closer (touch has no real hover, so a press does the same job
// there). Without hoverSrc, it's just the still image: same spot, same fade
// in on load, no interactivity.
type HoverArtworkProps = {
  defaultSrc: string;
  hoverSrc?: string;
  alt?: string;
};

// A crossfade between two different images reads as two objects swapping,
// not one thing transforming. A shared blur peak mid-transition bridges
// them into what looks like a single continuous change.
const PRESSED_CLEAN_STYLE = { opacity: 0, filter: "blur(3px)" };
const PRESSED_HOVER_STYLE = { opacity: 1, filter: "blur(0px)" };

export function HoverArtwork({
  defaultSrc,
  hoverSrc,
  alt = "",
}: HoverArtworkProps) {
  // Fades the whole piece in once the default image is actually decoded,
  // instead of letting it pop in mid-download.
  const [loaded, setLoaded] = useState(false);
  const defaultImgRef = useRef<HTMLImageElement>(null);

  // The hover image is only fetched once something actually reveals it —
  // most visits never trigger it.
  const [everHovered, setEverHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // A cached image can already be .complete by the time this effect runs,
  // in which case the load event fired before React attached the handler.
  useEffect(() => {
    if (defaultImgRef.current?.complete) setLoaded(true);
  }, []);

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
      // right/bottom only apply at sm+, paired with sm:fixed — position:
      // relative (needed on mobile so the absolute hover image has a
      // containing block) honors offsets too, so leaving them as an
      // always-on inline style shifted the whole box on mobile instead of
      // leaving it in normal flow.
      className="group relative mt-10 sm:fixed sm:right-[var(--page-pad-x)] sm:bottom-[var(--shelf-bottom)] sm:mt-0 z-40 transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{
        width: "clamp(176px, 28vw, 320px)",
        opacity: loaded ? 1 : 0,
      }}
      onPointerEnter={hoverSrc ? () => setEverHovered(true) : undefined}
      onPointerDown={hoverSrc ? onTouchDown : undefined}
      onPointerUp={hoverSrc ? onTouchUp : undefined}
      onPointerCancel={hoverSrc ? onTouchUp : undefined}
      onPointerLeave={hoverSrc ? onTouchUp : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={defaultImgRef}
        src={defaultSrc}
        alt={alt}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={
          hoverSrc
            ? "w-full select-none transition-[opacity,filter] duration-1000 ease-in-out group-hover:opacity-0 group-hover:blur-[3px]"
            : "w-full select-none"
        }
        style={pressed ? PRESSED_CLEAN_STYLE : undefined}
      />
      {hoverSrc && everHovered && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hoverSrc}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 w-full select-none opacity-0 blur-[2px] transition-[opacity,filter] duration-1000 ease-in-out group-hover:opacity-100 group-hover:blur-none"
          style={pressed ? PRESSED_HOVER_STYLE : undefined}
        />
      )}
    </div>
  );
}
